/**
 * @jest-environment node
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MpcApiError } from './mpcApiError';
import { getMpcStore } from './mpcStore';
import { confirmTotp, requireTotp, setupTotp } from './mpcTotp';
import { serverCrypto } from './serverCrypto';

jest.mock('server-only', () => ({}));

// The default store resolves its path lazily on first use, so the env var is set before any module runs.
const directory = mkdtempSync(join(tmpdir(), 'mpc-totp-'));
process.env.MPC_POC_STORE_PATH = join(directory, 'store.json');

const userId = 'user-totp';

const currentCode = (secret: string, stepOffset = 0) =>
    serverCrypto.computeTotp(secret, serverCrypto.getTotpStep() + stepOffset);

const expectApiError = (action: () => void, code: string) => {
    try {
        action();
        throw new Error('Expected the action to throw.');
    } catch (error) {
        expect(error).toBeInstanceOf(MpcApiError);
        expect((error as MpcApiError).code).toEqual(code);
    }
};

describe('mpcTotp', () => {
    beforeAll(() => {
        getMpcStore().update((data) => {
            data.users.push({
                id: userId,
                username: 'alice',
                passwordHash: 'x',
                salt: 'y',
                createdAt: '2026-01-01T00:00:00.000Z',
            });
        });
    });

    afterAll(() => {
        getMpcStore().reset();
        rmSync(directory, { recursive: true, force: true });
    });

    it('passes through users that never enrolled', () => {
        expect(() => requireTotp(userId, undefined)).not.toThrow();
        expect(() => requireTotp(userId, '123456')).not.toThrow();
    });

    it('rejects a confirmation without a pending enrollment', () => {
        expectApiError(() => confirmTotp(userId, '123456'), 'conflict');
    });

    it('enrolls with the setup + verify flow and enforces the code afterwards', () => {
        const setup = setupTotp(userId);

        expect(setup.secret).toMatch(/^[A-Z2-7]{32}$/);
        expect(setup.otpauthUri).toContain('otpauth://totp/');
        expect(setup.otpauthUri).toContain(setup.secret);

        // Idempotent until confirmed: a duplicate setup call (e.g. strict-mode double effect) returns the
        // same secret, so the QR on screen always matches the co-signer state.
        expect(setupTotp(userId).secret).toEqual(setup.secret);

        // Wrong confirmation code first, then the real one.
        expectApiError(() => confirmTotp(userId, '000000'), 'unauthorized');
        confirmTotp(userId, currentCode(setup.secret));

        // Enrolled: the code is now required.
        expectApiError(() => requireTotp(userId, undefined), 'unauthorized');
        expectApiError(() => requireTotp(userId, '999999'), 'unauthorized');

        // The confirmation already consumed the current step: use the next one (accepted by the ±1 window).
        const nextCode = currentCode(setup.secret, 1);
        expect(() => requireTotp(userId, nextCode)).not.toThrow();

        // Replay of the same code is rejected.
        expectApiError(() => requireTotp(userId, nextCode), 'unauthorized');
    });

    it('locks the user after repeated failures', () => {
        const setup = setupTotp(userId);
        confirmTotp(userId, currentCode(setup.secret));

        for (let attempt = 0; attempt < 4; attempt++) {
            expectApiError(() => requireTotp(userId, '111111'), 'unauthorized');
        }

        // 5th failure locks, subsequent attempts are rate limited even with a valid code.
        expectApiError(() => requireTotp(userId, '111111'), 'unauthorized');
        expectApiError(
            () => requireTotp(userId, currentCode(setup.secret, 1)),
            'rate_limited',
        );
    });
});
