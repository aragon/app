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
            // Flip the first byte (always changes it, whatever its value).
            const firstByte = encrypted.ciphertext.slice(0, 2);
            const flipped = firstByte === 'ff' ? '00' : 'ff';
            const tampered = {
                ...encrypted,
                ciphertext: flipped + encrypted.ciphertext.slice(2),
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

    describe('totp', () => {
        // RFC 6238 appendix B SHA-1 vectors: ASCII secret "12345678901234567890" (base32 below), 8-digit codes
        // truncated to the 6 last digits (mod 10^6 of the same dynamic binary code).
        const rfcSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
        const rfcVectors: [number, string][] = [
            [59, '287082'],
            [1_111_111_109, '081804'],
            [1_234_567_890, '005924'],
            [2_000_000_000, '279037'],
        ];

        it('computes the RFC 6238 reference codes', () => {
            for (const [timeSeconds, code] of rfcVectors) {
                const step = Math.floor(timeSeconds / 30);
                expect(serverCrypto.computeTotp(rfcSecret, step)).toEqual(code);
            }
        });

        it('generates base32 secrets', () => {
            const secret = serverCrypto.generateTotpSecret();

            expect(secret).toMatch(/^[A-Z2-7]{32}$/);
            expect(serverCrypto.generateTotpSecret()).not.toEqual(secret);
        });

        it('verifies codes within the step window and rejects others', () => {
            const timestampMs = 1_234_567_890 * 1000;
            const step = serverCrypto.getTotpStep(timestampMs);

            expect(
                serverCrypto.verifyTotp(rfcSecret, '005924', { timestampMs }),
            ).toEqual(step);
            // Previous / next steps are accepted with the default ±1 window.
            expect(
                serverCrypto.verifyTotp(
                    rfcSecret,
                    serverCrypto.computeTotp(rfcSecret, step - 1),
                    { timestampMs },
                ),
            ).toEqual(step - 1);
            expect(
                serverCrypto.verifyTotp(
                    rfcSecret,
                    serverCrypto.computeTotp(rfcSecret, step + 2),
                    { timestampMs },
                ),
            ).toBeUndefined();
            expect(
                serverCrypto.verifyTotp(rfcSecret, '000000', { timestampMs }),
            ).toBeUndefined();
        });
    });
});
