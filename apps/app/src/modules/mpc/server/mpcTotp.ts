import 'server-only';
import { MpcApiError } from './mpcApiError';
import { MPC_LOGIN_LOCK_MS, MPC_LOGIN_MAX_FAILURES } from './mpcAuth';
import {
    getMpcStore,
    type IMpcStoreData,
    type IMpcStoreUser,
    nowIso,
} from './mpcStore';
import { serverCrypto } from './serverCrypto';

/**
 * TOTP second factor of the mock co-signer (RFC 6238, Google Authenticator compatible). Enrollment is a
 * two-step flow (setup stores a pending secret, verify activates it); once enrolled, the user's code is
 * required to release the server share and to approve sign requests. Secrets are encrypted at rest with the
 * server key, verification is rate limited like the login and every accepted step is persisted so a code can
 * only be used once (replay guard).
 */

export const MPC_TOTP_ISSUER = 'Aragon MPC';

export interface IMpcTotpSetup {
    /**
     * Base32 secret to enter manually in the authenticator app.
     */
    secret: string;
    /**
     * otpauth:// URI encoding the secret, rendered as a QR code by the client.
     */
    otpauthUri: string;
}

const TOTP_CODE_REGEX = /^\d{6}$/;

const attemptKey = (userId: string): string => `totp:${userId}`;

const requireUserRecord = (
    data: IMpcStoreData,
    userId: string,
): IMpcStoreUser => {
    const user = data.users.find((item) => item.id === userId);

    if (user == null) {
        throw new MpcApiError('not_found', 'User not found.');
    }

    return user;
};

const assertNotLocked = (userId: string): void => {
    const attempt = getMpcStore().read().loginAttempts[attemptKey(userId)];

    if (attempt?.lockedUntil != null && attempt.lockedUntil > Date.now()) {
        throw new MpcApiError(
            'rate_limited',
            'Too many failed two-factor attempts. Try again later.',
        );
    }
};

const recordFailure = (userId: string): void => {
    const now = Date.now();

    getMpcStore().update((data) => {
        const key = attemptKey(userId);
        const current = data.loginAttempts[key];
        const isWindowActive =
            current != null && now - current.firstFailureAt < MPC_LOGIN_LOCK_MS;

        const failures = isWindowActive ? current.failures + 1 : 1;

        data.loginAttempts[key] = {
            failures,
            firstFailureAt: isWindowActive ? current.firstFailureAt : now,
            lockedUntil:
                failures >= MPC_LOGIN_MAX_FAILURES
                    ? now + MPC_LOGIN_LOCK_MS
                    : undefined,
        };
    });
};

const clearFailures = (userId: string): void => {
    getMpcStore().update((data) => {
        delete data.loginAttempts[attemptKey(userId)];
    });
};

const buildOtpauthUri = (secret: string, username: string): string => {
    const issuer = encodeURIComponent(MPC_TOTP_ISSUER);
    const label = `${issuer}:${encodeURIComponent(username)}`;

    return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
};

/**
 * Returns the pending TOTP secret of the user, generating one when there is none. Idempotent: repeated calls
 * (e.g. the enrollment screen mounting twice in React strict mode) return the same secret, so the QR code on
 * screen always matches what the co-signer verifies. The pending secret is cleared by the confirmation, after
 * which a new setup call starts a fresh enrollment; an active secret stays valid until then.
 */
export const setupTotp = (userId: string): IMpcTotpSetup => {
    const newSecret = serverCrypto.generateTotpSecret();

    return getMpcStore().update((data) => {
        const user = requireUserRecord(data, userId);
        const pendingSecret = user.totp?.pendingSecret;
        const secret =
            pendingSecret != null
                ? serverCrypto.decrypt(pendingSecret)
                : newSecret;

        user.totp = {
            ...user.totp,
            pendingSecret: pendingSecret ?? serverCrypto.encrypt(secret),
        };

        return { secret, otpauthUri: buildOtpauthUri(secret, user.username) };
    });
};

/**
 * Confirms the pending secret with a code from the authenticator app and activates it.
 */
export const confirmTotp = (userId: string, code: string): void => {
    assertNotLocked(userId);

    const pendingSecret = getMpcStore().update((data) => {
        const user = requireUserRecord(data, userId);

        return user.totp?.pendingSecret;
    });

    if (pendingSecret == null) {
        throw new MpcApiError(
            'conflict',
            'No pending two-factor enrollment. Call the setup endpoint first.',
        );
    }

    const secret = serverCrypto.decrypt(pendingSecret);
    const matchedStep = TOTP_CODE_REGEX.test(code)
        ? serverCrypto.verifyTotp(secret, code)
        : undefined;

    if (matchedStep == null) {
        recordFailure(userId);
        throw new MpcApiError('unauthorized', 'Invalid two-factor code.');
    }

    clearFailures(userId);

    // The pending secret becomes the active one and is cleared: the next setup call starts a fresh enrollment.
    getMpcStore().update((data) => {
        const user = requireUserRecord(data, userId);

        user.totp = {
            secret: pendingSecret,
            confirmedAt: nowIso(),
            lastUsedStep: matchedStep,
        };
    });
};

export const isTotpEnabled = (user: IMpcStoreUser): boolean =>
    user.totp?.secret != null;

/**
 * Enforces the second factor of an enrolled user: the code is required, rate limited, verified against the
 * active secret and accepted only once per step (replay guard). Users that never enrolled pass through — the
 * POC UI enforces the enrollment right after the registration.
 */
export const requireTotp = (userId: string, code: string | undefined): void => {
    const activeSecret = getMpcStore().update((data) => {
        const user = requireUserRecord(data, userId);

        return user.totp?.secret;
    });

    if (activeSecret == null) {
        return;
    }

    if (code == null || code.length === 0) {
        throw new MpcApiError(
            'unauthorized',
            'Two-factor code required for this action.',
        );
    }

    assertNotLocked(userId);

    const secret = serverCrypto.decrypt(activeSecret);
    const matchedStep = TOTP_CODE_REGEX.test(code)
        ? serverCrypto.verifyTotp(secret, code)
        : undefined;

    const isReplay = getMpcStore().update((data) => {
        if (matchedStep == null) {
            return false;
        }

        const user = requireUserRecord(data, userId);
        const lastUsedStep = user.totp?.lastUsedStep;

        if (lastUsedStep != null && matchedStep <= lastUsedStep) {
            return true;
        }

        user.totp = { ...user.totp, lastUsedStep: matchedStep };

        return false;
    });

    if (matchedStep == null || isReplay) {
        recordFailure(userId);
        throw new MpcApiError('unauthorized', 'Invalid two-factor code.');
    }

    clearFailures(userId);
};
