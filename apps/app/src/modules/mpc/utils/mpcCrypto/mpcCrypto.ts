import type { Hex } from 'viem';

/**
 * POC / mock client crypto helpers (WebCrypto): secret derived AES-GCM encryption for the device share.
 * The secret is the per-browser device key (see utils/deviceKey), never a user-provided value.
 */

export interface IEncryptedPayload {
    /**
     * PBKDF2 salt (0x hex, 16 bytes).
     */
    salt: Hex;
    /**
     * AES-GCM iv (0x hex, 12 bytes).
     */
    iv: Hex;
    /**
     * Ciphertext including the GCM tag (0x hex).
     */
    ciphertext: Hex;
}

export const MPC_PBKDF2_ITERATIONS = 310_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const getCrypto = (): Crypto => {
    const webCrypto = globalThis.crypto;

    if (webCrypto?.subtle == null) {
        throw new Error('mpcCrypto: WebCrypto is not available');
    }

    return webCrypto;
};

export const bytesToHex = (bytes: Uint8Array): Hex => {
    let result = '';

    for (const byte of bytes) {
        result += byte.toString(16).padStart(2, '0');
    }

    return `0x${result}`;
};

export const hexToBytes = (hex: Hex | string): Uint8Array => {
    const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;

    if (normalized.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(normalized)) {
        throw new Error('mpcCrypto: invalid hex string');
    }

    const bytes = new Uint8Array(normalized.length / 2);

    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
    }

    return bytes;
};

/**
 * Returns `bytes` random bytes as 0x hex.
 */
export const randomHex = (bytes: number): Hex => {
    const buffer = new Uint8Array(bytes);
    getCrypto().getRandomValues(buffer);

    return bytesToHex(buffer);
};

/**
 * Derives an AES-GCM 256 key from a secret using PBKDF2-SHA256.
 */
export const deriveKeyFromSecret = async (
    secret: string,
    salt: Uint8Array,
    iterations: number = MPC_PBKDF2_ITERATIONS,
): Promise<CryptoKey> => {
    const { subtle } = getCrypto();
    const secretBytes = new TextEncoder().encode(secret);
    const baseKey = await subtle.importKey(
        'raw',
        secretBytes,
        'PBKDF2',
        false,
        ['deriveKey'],
    );
    secretBytes.fill(0);

    return subtle.deriveKey(
        {
            name: 'PBKDF2',
            hash: 'SHA-256',
            salt: salt as BufferSource,
            iterations,
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );
};

/**
 * Encrypts a hex plaintext with a key derived from the secret (random salt and iv).
 */
export const encryptWithSecret = async (
    plaintextHex: Hex,
    secret: string,
): Promise<IEncryptedPayload> => {
    const { subtle } = getCrypto();
    const salt = hexToBytes(randomHex(SALT_BYTES));
    const iv = hexToBytes(randomHex(IV_BYTES));
    const key = await deriveKeyFromSecret(secret, salt);
    const plaintext = hexToBytes(plaintextHex);
    const ciphertext = await subtle.encrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        plaintext as BufferSource,
    );
    plaintext.fill(0);

    return {
        salt: bytesToHex(salt),
        iv: bytesToHex(iv),
        ciphertext: bytesToHex(new Uint8Array(ciphertext)),
    };
};

/**
 * Decrypts a payload produced by encryptWithSecret. Throws on wrong secret / tampered data.
 */
export const decryptWithSecret = async (
    payload: IEncryptedPayload,
    secret: string,
): Promise<Hex> => {
    const { subtle } = getCrypto();
    const salt = hexToBytes(payload.salt);
    const iv = hexToBytes(payload.iv);
    const key = await deriveKeyFromSecret(secret, salt);

    let plaintext: ArrayBuffer;

    try {
        plaintext = await subtle.decrypt(
            { name: 'AES-GCM', iv: iv as BufferSource },
            key,
            hexToBytes(payload.ciphertext) as BufferSource,
        );
    } catch {
        throw new Error('mpcCrypto: decryption failed (wrong device key?)');
    }

    const bytes = new Uint8Array(plaintext);
    const result = bytesToHex(bytes);
    bytes.fill(0);

    return result;
};

export const mpcCrypto = {
    randomHex,
    bytesToHex,
    hexToBytes,
    deriveKeyFromSecret,
    encryptWithSecret,
    decryptWithSecret,
};
