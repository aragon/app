import { webcrypto } from 'node:crypto';
import {
    combineShares,
    hexToShare,
    SECP256K1_ORDER,
    shareToHex,
    splitSecret,
} from './shamir';

describe('shamir utils', () => {
    beforeAll(() => {
        // jsdom does not expose WebCrypto, use the node implementation
        if (globalThis.crypto?.getRandomValues == null) {
            Object.defineProperty(globalThis, 'crypto', {
                value: webcrypto,
                configurable: true,
            });
        }
    });

    const secret = BigInt(
        '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318',
    );

    it('splits a secret in 3 shares with unique indexes', () => {
        const shares = splitSecret(secret);
        expect(shares).toHaveLength(3);
        expect(shares.map((share) => share.index)).toEqual([1, 2, 3]);
    });

    it('recovers the secret with any pair of shares', () => {
        const shares = splitSecret(secret);
        const pairs = [
            [shares[0], shares[1]],
            [shares[0], shares[2]],
            [shares[1], shares[2]],
            [shares[2], shares[0]],
        ];
        for (const pair of pairs) {
            expect(combineShares(pair)).toBe(secret);
        }
    });

    it('recovers the secret with all shares', () => {
        const shares = splitSecret(secret);
        expect(combineShares(shares)).toBe(secret);
    });

    it('does not recover the secret with a single share', () => {
        const shares = splitSecret(secret);
        expect(() => combineShares([shares[0]])).toThrow();
        expect(shares[0].value).not.toBe(secret);
    });

    it('handles secret equal to zero', () => {
        const shares = splitSecret(BigInt(0));
        expect(combineShares([shares[1], shares[2]])).toBe(BigInt(0));
    });

    it('handles secret close to the field order', () => {
        const nearOrder = SECP256K1_ORDER - BigInt(1);
        const shares = splitSecret(nearOrder);
        expect(combineShares([shares[0], shares[2]])).toBe(nearOrder);
    });

    it('throws when the secret is out of the field', () => {
        expect(() => splitSecret(SECP256K1_ORDER)).toThrow();
        expect(() => splitSecret(BigInt(-1))).toThrow();
    });

    it('throws on duplicated share indexes', () => {
        const shares = splitSecret(secret);
        expect(() => combineShares([shares[0], shares[0]])).toThrow();
    });

    it('serializes and parses shares as 32-byte hex', () => {
        const shares = splitSecret(secret);
        const hex = shareToHex(shares[1]);
        expect(hex).toMatch(/^0x[0-9a-f]{64}$/);
        const parsed = hexToShare(2, hex);
        expect(parsed).toEqual(shares[1]);
        expect(combineShares([shares[0], parsed])).toBe(secret);
    });

    it('supports a higher threshold', () => {
        const shares = splitSecret(secret, 3, 5);
        expect(combineShares([shares[0], shares[2], shares[4]])).toBe(secret);
        expect(combineShares([shares[0], shares[2]])).not.toBe(secret);
    });
});
