import 'server-only';
import type { NextRequest } from 'next/server';
import type {
    IMpcSession,
    IMpcUser,
} from '@/modules/mpc/api/mpcService/domain';
import { MpcApiError } from './mpcApiError';
import {
    getMpcStore,
    type IMpcStoreLoginAttempt,
    type IMpcStoreSession,
    type IMpcStoreUser,
    type MpcStore,
    nowIso,
} from './mpcStore';
import { serverCrypto } from './serverCrypto';

/**
 * POC mock authentication (username / password + server-side sessions in the JSON store).
 * Sessions: 8h absolute TTL and 30 min idle timeout, cookie "aragon_mpc_session" (HttpOnly, SameSite=Strict,
 * Secure in production, Path=/). Login rate limit: 5 failures within 15 minutes lock the username and the IP
 * for 15 minutes. Error messages are generic to avoid user enumeration.
 */

export const MPC_SESSION_COOKIE = 'aragon_mpc_session';

export const MPC_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const MPC_SESSION_IDLE_MS = 30 * 60 * 1000;
export const MPC_LOGIN_MAX_FAILURES = 5;
export const MPC_LOGIN_LOCK_MS = 15 * 60 * 1000;

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,32}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const GENERIC_LOGIN_ERROR = 'Invalid username or password.';

export interface IMpcRequestMeta {
    ip?: string;
    userAgent?: string;
}

export interface IMpcAuthResult {
    session: IMpcSession;
    /**
     * Raw session token to set in the cookie (only the hash is stored).
     */
    token: string;
}

export interface IMpcResolvedSession {
    user: IMpcUser;
    session: IMpcStoreSession;
}

export const toPublicUser = (user: IMpcStoreUser): IMpcUser => ({
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    totpEnabled: user.totp?.secret != null,
});

export const getRequestMeta = (request: NextRequest): IMpcRequestMeta => {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip =
        forwardedFor?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip')?.trim() ||
        undefined;
    const userAgent = request.headers.get('user-agent') ?? undefined;

    return { ip, userAgent: userAgent?.slice(0, 256) };
};

export const validateCredentials = (
    username: unknown,
    password: unknown,
): { username: string; password: string } => {
    if (typeof username !== 'string' || !USERNAME_REGEX.test(username)) {
        throw new MpcApiError(
            'validation_error',
            'Username must be 3-32 characters (letters, numbers, ".", "_" or "-").',
        );
    }

    if (
        typeof password !== 'string' ||
        password.length < PASSWORD_MIN_LENGTH ||
        password.length > PASSWORD_MAX_LENGTH
    ) {
        throw new MpcApiError(
            'validation_error',
            `Password must be between ${PASSWORD_MIN_LENGTH.toString()} and ${PASSWORD_MAX_LENGTH.toString()} characters.`,
        );
    }

    return { username, password };
};

export class MpcAuth {
    constructor(private readonly getStore: () => MpcStore) {}

    // Anonymous registration is opt-in in production (MPC_POC_ALLOW_REGISTER=true) and enabled by default elsewhere
    // unless explicitly disabled.
    isRegisterEnabled = (): boolean => {
        const flag = process.env.MPC_POC_ALLOW_REGISTER;

        if (flag != null && flag !== '') {
            return flag === 'true';
        }

        return process.env.NODE_ENV !== 'production';
    };

    /**
     * Registers a new user and opens a session.
     */
    register = async (
        params: { username: string; password: string },
        meta: IMpcRequestMeta,
    ): Promise<IMpcAuthResult> => {
        if (!this.isRegisterEnabled()) {
            throw new MpcApiError(
                'forbidden',
                'Registration is disabled (set MPC_POC_ALLOW_REGISTER=true to enable it).',
            );
        }

        const { username, password } = validateCredentials(
            params.username,
            params.password,
        );

        this.assertNotLocked(username, meta.ip);

        const passwordHash = await serverCrypto.hashPassword(password);
        const store = this.getStore();

        const user = store.update((data): IMpcStoreUser => {
            const existing = data.users.find(
                (item) =>
                    item.username.toLowerCase() === username.toLowerCase(),
            );

            if (existing != null) {
                throw new MpcApiError('conflict', 'Username is not available.');
            }

            const newUser: IMpcStoreUser = {
                id: serverCrypto.randomId(),
                username,
                passwordHash: passwordHash.hash,
                salt: passwordHash.salt,
                createdAt: nowIso(),
            };
            data.users.push(newUser);

            return newUser;
        });

        return this.createSession(user, meta);
    };

    /**
     * Verifies credentials (rate limited) and opens a session.
     */
    login = async (
        params: { username: string; password: string },
        meta: IMpcRequestMeta,
    ): Promise<IMpcAuthResult> => {
        const username =
            typeof params.username === 'string' ? params.username : '';
        const password =
            typeof params.password === 'string' ? params.password : '';

        this.assertNotLocked(username, meta.ip);

        const store = this.getStore();
        const user = store
            .read()
            .users.find(
                (item) =>
                    item.username.toLowerCase() === username.toLowerCase(),
            );

        // Always run the hash verification to keep timing similar for unknown users.
        const isValid =
            user != null
                ? await serverCrypto.verifyPassword(password, {
                      hash: user.passwordHash,
                      salt: user.salt,
                  })
                : await this.burnVerification(password);

        if (user == null || !isValid) {
            this.recordFailure(username, meta.ip);
            throw new MpcApiError('unauthorized', GENERIC_LOGIN_ERROR);
        }

        this.clearFailures(username, meta.ip);

        return this.createSession(user, meta);
    };

    /**
     * Invalidates the session identified by the given raw token.
     */
    logout = (token: string | undefined): void => {
        if (token == null || token.length === 0) {
            return;
        }

        const sessionId = serverCrypto.sha256(token);
        this.getStore().update((data) => {
            data.sessions = data.sessions.filter(
                (item) => item.id !== sessionId,
            );
        });
    };

    /**
     * Resolves the session from the request cookie, enforcing TTL and idle timeout. Touches lastSeenAt.
     */
    getSessionFromRequest = (
        request: NextRequest,
    ): IMpcResolvedSession | undefined => {
        const token = request.cookies.get(MPC_SESSION_COOKIE)?.value;

        if (token == null || token.length === 0) {
            return undefined;
        }

        return this.getSessionFromToken(token);
    };

    getSessionFromToken = (token: string): IMpcResolvedSession | undefined => {
        const sessionId = serverCrypto.sha256(token);
        const store = this.getStore();
        const now = Date.now();

        return store.update((data): IMpcResolvedSession | undefined => {
            const session = data.sessions.find((item) => item.id === sessionId);

            if (session == null) {
                return undefined;
            }

            const isExpired = new Date(session.expiresAt).getTime() <= now;
            const isIdle =
                now - new Date(session.lastSeenAt).getTime() >
                MPC_SESSION_IDLE_MS;

            if (isExpired || isIdle) {
                data.sessions = data.sessions.filter(
                    (item) => item.id !== sessionId,
                );

                return undefined;
            }

            const user = data.users.find((item) => item.id === session.userId);

            if (user == null) {
                return undefined;
            }

            session.lastSeenAt = new Date(now).toISOString();

            return { user: toPublicUser(user), session };
        });
    };

    requireSession = (request: NextRequest): IMpcResolvedSession => {
        const resolved = this.getSessionFromRequest(request);

        if (resolved == null) {
            throw new MpcApiError('unauthorized', 'Authentication required.');
        }

        return resolved;
    };

    /**
     * Builds the Set-Cookie header value for the session cookie.
     */
    buildSessionCookie = (token: string, expiresAt: string): string =>
        this.serializeCookie(token, new Date(expiresAt));

    /**
     * Builds the Set-Cookie header value clearing the session cookie.
     */
    buildClearSessionCookie = (): string =>
        this.serializeCookie('', new Date(0));

    private serializeCookie = (value: string, expires: Date): string => {
        const parts = [
            `${MPC_SESSION_COOKIE}=${value}`,
            'Path=/',
            'HttpOnly',
            'SameSite=Strict',
            `Expires=${expires.toUTCString()}`,
        ];

        if (process.env.NODE_ENV === 'production') {
            parts.push('Secure');
        }

        return parts.join('; ');
    };

    private createSession = (
        user: IMpcStoreUser,
        meta: IMpcRequestMeta,
    ): IMpcAuthResult => {
        const token = serverCrypto.randomToken();
        const now = Date.now();
        const session: IMpcStoreSession = {
            id: serverCrypto.sha256(token),
            userId: user.id,
            createdAt: new Date(now).toISOString(),
            expiresAt: new Date(now + MPC_SESSION_TTL_MS).toISOString(),
            lastSeenAt: new Date(now).toISOString(),
            ip: meta.ip,
            userAgent: meta.userAgent,
        };

        this.getStore().update((data) => {
            // Opportunistic cleanup of expired sessions.
            data.sessions = data.sessions.filter(
                (item) => new Date(item.expiresAt).getTime() > now,
            );
            data.sessions.push(session);
        });

        return {
            token,
            session: { user: toPublicUser(user), expiresAt: session.expiresAt },
        };
    };

    private attemptKeys = (username: string, ip?: string): string[] => {
        const keys = [`user:${username.toLowerCase()}`];

        if (ip != null && ip.length > 0) {
            keys.push(`ip:${ip}`);
        }

        return keys;
    };

    private assertNotLocked = (username: string, ip?: string): void => {
        const { loginAttempts } = this.getStore().read();
        const now = Date.now();

        const isLocked = this.attemptKeys(username, ip).some((key) => {
            const attempt = loginAttempts[key];

            return attempt?.lockedUntil != null && attempt.lockedUntil > now;
        });

        if (isLocked) {
            throw new MpcApiError(
                'rate_limited',
                'Too many failed attempts. Try again later.',
            );
        }
    };

    private recordFailure = (username: string, ip?: string): void => {
        const now = Date.now();

        this.getStore().update((data) => {
            for (const key of this.attemptKeys(username, ip)) {
                const current: IMpcStoreLoginAttempt | undefined =
                    data.loginAttempts[key];
                const isWindowActive =
                    current != null &&
                    now - current.firstFailureAt < MPC_LOGIN_LOCK_MS;

                const failures = isWindowActive ? current.failures + 1 : 1;
                const firstFailureAt = isWindowActive
                    ? current.firstFailureAt
                    : now;
                const lockedUntil =
                    failures >= MPC_LOGIN_MAX_FAILURES
                        ? now + MPC_LOGIN_LOCK_MS
                        : undefined;

                data.loginAttempts[key] = {
                    failures,
                    firstFailureAt,
                    lockedUntil,
                };
            }
        });
    };

    private clearFailures = (username: string, ip?: string): void => {
        this.getStore().update((data) => {
            for (const key of this.attemptKeys(username, ip)) {
                delete data.loginAttempts[key];
            }
        });
    };

    // Dummy scrypt run to reduce timing differences between unknown and known users.
    private burnVerification = async (password: string): Promise<boolean> => {
        await serverCrypto.hashPassword(password);

        return false;
    };
}

export const mpcAuth = new MpcAuth(getMpcStore);
