/**
 * @jest-environment node
 */

import { serverCrypto } from './serverCrypto';

jest.mock('server-only', () => ({}));

describe('serverCrypto', () => {
    const originalKey = process.env.MPC_POC_SERVER_KEY;

    afterEach(() => {
        process.env.MPC_POC_SERVER_KEY = originalKey;
    });

    describe('encrypt / decrypt', () => {
        it('round-trips a value with the server key', () => {
            const encrypted = serverCrypto.encrypt('0xabc123-share');

            expect(encrypted.ciphertext).not.toContain('share');
            expect(encrypted.iv).toHaveLength(24);
            expect(encrypted.tag).toHaveLength(32);
            expect(serverCrypto.decrypt(encrypted)).toEqual('0xabc123-share');
        });

        it('uses a random iv for every encryption', () => {
            const first = serverCrypto.encrypt('same');
            const second = serverCrypto.encrypt('same');

            expect(first.iv).not.toEqual(second.iv);
            expect(first.ciphertext).not.toEqual(second.ciphertext);
        });

        it('throws when the ciphertext is tampered with', () => {
            const encrypted = serverCrypto.encrypt('secret');
            const tampered = {
                ...encrypted,
                ciphertext: encrypted.ciphertext.replace(/^../, 'ff'),
            };

            expect(() => serverCrypto.decrypt(tampered)).toThrow();
        });

        it('supports an explicit key', () => {
            const key = Buffer.from(serverCrypto.generateServerKey(), 'hex');
            const encrypted = serverCrypto.encrypt('value', key);

            expect(serverCrypto.decrypt(encrypted, key)).toEqual('value');
            expect(() => serverCrypto.decrypt(encrypted)).toThrow();
        });
    });

    describe('hashPassword / verifyPassword', () => {
        it('verifies the correct password and rejects the wrong one', async () => {
            const hashed = await serverCrypto.hashPassword('correct horse');

            expect(hashed.hash).not.toContain('correct');
            expect(
                await serverCrypto.verifyPassword('correct horse', hashed),
            ).toBeTruthy();
            expect(
                await serverCrypto.verifyPassword('wrong horse', hashed),
            ).toBeFalsy();
        });

        it('produces different hashes for the same password (random salt)', async () => {
            const first = await serverCrypto.hashPassword('password123');
            const second = await serverCrypto.hashPassword('password123');

            expect(first.salt).not.toEqual(second.salt);
            expect(first.hash).not.toEqual(second.hash);
        });
    });

    describe('random helpers', () => {
        it('generates hex ids and tokens of the expected length', () => {
            expect(serverCrypto.randomId()).toMatch(/^[0-9a-f]{32}$/);
            expect(serverCrypto.randomToken()).toMatch(/^[0-9a-f]{64}$/);
            expect(serverCrypto.sha256('a')).toHaveLength(64);
        });
    });
});
