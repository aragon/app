import { setupWebCrypto } from '@/modules/mpc/testUtils/setupWebCrypto';
import {
    bytesToHex,
    decryptWithPassphrase,
    deriveKeyFromPassphrase,
    encryptWithPassphrase,
    hexToBytes,
    randomHex,
} from './mpcCrypto';

describe('mpcCrypto utils', () => {
    beforeAll(() => {
        setupWebCrypto();
    });

    const plaintext =
        '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318';

    it('generates random hex of the requested size', () => {
        const value = randomHex(16);
        expect(value).toMatch(/^0x[0-9a-f]{32}$/);
        expect(randomHex(16)).not.toEqual(value);
    });

    it('converts bytes to hex and back', () => {
        const bytes = new Uint8Array([0, 1, 255, 16]);
        const hex = bytesToHex(bytes);
        expect(hex).toBe('0x0001ff10');
        expect(Array.from(hexToBytes(hex))).toEqual([0, 1, 255, 16]);
    });

    it('derives an AES-GCM key from a passphrase', async () => {
        const key = await deriveKeyFromPassphrase(
            'passphrase',
            hexToBytes(randomHex(16)),
            1000,
        );
        expect(key.algorithm).toEqual({ name: 'AES-GCM', length: 256 });
    });

    it('encrypts and decrypts with the same passphrase', async () => {
        const encrypted = await encryptWithPassphrase(plaintext, 'secret-pass');
        expect(encrypted.salt).toMatch(/^0x[0-9a-f]{32}$/);
        expect(encrypted.iv).toMatch(/^0x[0-9a-f]{24}$/);
        expect(encrypted.ciphertext).not.toEqual(plaintext);
        const decrypted = await decryptWithPassphrase(encrypted, 'secret-pass');
        expect(decrypted).toBe(plaintext);
    }, 20_000);

    it('fails to decrypt with a wrong passphrase', async () => {
        const encrypted = await encryptWithPassphrase(plaintext, 'secret-pass');
        await expect(
            decryptWithPassphrase(encrypted, 'wrong-pass'),
        ).rejects.toThrow();
    }, 20_000);
});
