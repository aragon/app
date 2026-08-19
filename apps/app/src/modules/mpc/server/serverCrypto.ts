import 'server-only';
import {
    createCipheriv,
    createDecipheriv,
    createHash,
    randomBytes,
    scrypt as scryptCallback,
    timingSafeEqual,
} from 'node:crypto';

/**
 * POC server-side crypto helpers (Node crypto): AES-256-GCM at rest, scrypt password hashing and random ids.
 * The mock co-signer only holds one Shamir share; this module protects it at rest.
 */

const AES_ALGORITHM = 'aes-256-gcm';
const AES_IV_BYTES = 12;
const AES_KEY_BYTES = 32;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_SALT_BYTES = 16;

// scrypt parameters (N=16384, r=8, p=1) as documented in the POC spec.
const SCRYPT_OPTIONS = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export interface IMpcEncryptedValue {
    /**
     * Ciphertext (hex).
     */
    ciphertext: string;
    /**
     * AES-GCM initialization vector (hex, 12 bytes).
     */
    iv: string;
    /**
     * AES-GCM authentication tag (hex).
     */
    tag: string;
}

export interface IMpcPasswordHash {
    /**
     * scrypt derived key (hex).
     */
    hash: string;
    /**
     * Salt (hex).
     */
    salt: string;
}

class ServerCrypto {
    private serverKey: Buffer | undefined;
    private warnedDevKey = false;

    /**
     * Returns the AES-256 key used to protect data at rest. Uses MPC_POC_SERVER_KEY (hex, 32 bytes) or, in
     * non-production environments, a deterministic development key (POC only, warns once).
     */
    getServerKey = (): Buffer => {
        if (this.serverKey != null) {
            return this.serverKey;
        }

        const envKey = process.env.MPC_POC_SERVER_KEY?.trim();

        if (envKey != null && envKey.length > 0) {
            const normalizedKey = envKey.startsWith('0x')
                ? envKey.slice(2)
                : envKey;

            if (!/^[0-9a-fA-F]{64}$/.test(normalizedKey)) {
                throw new Error(
                    'MPC_POC_SERVER_KEY must be a 32-byte hex string (64 hex characters).',
                );
            }

            this.serverKey = Buffer.from(normalizedKey, 'hex');

            return this.serverKey;
        }

        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                'MPC_POC_SERVER_KEY is required in production environments.',
            );
        }

        if (!this.warnedDevKey) {
            this.warnedDevKey = true;
            // biome-ignore lint/suspicious/noConsole: intentional one-time warning for the POC development key
            console.warn(
                '[mpc-poc] MPC_POC_SERVER_KEY is not set, using a deterministic development key. DO NOT use in production.',
            );
        }

        // POC: deterministic development key so local stores survive restarts.
        this.serverKey = createHash('sha256')
            .update('aragon-mpc-poc-development-key')
            .digest();

        return this.serverKey;
    };

    /**
     * Encrypts an UTF-8 string with AES-256-GCM using the server key.
     */
    encrypt = (plaintext: string, key?: Buffer): IMpcEncryptedValue => {
        const encryptionKey = key ?? this.getServerKey();
        const iv = randomBytes(AES_IV_BYTES);
        const cipher = createCipheriv(AES_ALGORITHM, encryptionKey, iv);
        const ciphertext = Buffer.concat([
            cipher.update(plaintext, 'utf8'),
            cipher.final(),
        ]);
        const tag = cipher.getAuthTag();

        return {
            ciphertext: ciphertext.toString('hex'),
            iv: iv.toString('hex'),
            tag: tag.toString('hex'),
        };
    };

    /**
     * Decrypts a value produced by encrypt. Throws when the ciphertext or tag were tampered with.
     */
    decrypt = (value: IMpcEncryptedValue, key?: Buffer): string => {
        const decryptionKey = key ?? this.getServerKey();
        const decipher = createDecipheriv(
            AES_ALGORITHM,
            decryptionKey,
            Buffer.from(value.iv, 'hex'),
        );
        decipher.setAuthTag(Buffer.from(value.tag, 'hex'));

        const plaintext = Buffer.concat([
            decipher.update(Buffer.from(value.ciphertext, 'hex')),
            decipher.final(),
        ]);

        return plaintext.toString('utf8');
    };

    /**
     * Hashes a password with scrypt and a random salt.
     */
    hashPassword = async (password: string): Promise<IMpcPasswordHash> => {
        const salt = randomBytes(SCRYPT_SALT_BYTES);
        const hash = await this.deriveScrypt(password, salt);

        return { hash: hash.toString('hex'), salt: salt.toString('hex') };
    };

    /**
     * Verifies a password against a stored scrypt hash using a constant-time comparison.
     */
    verifyPassword = async (
        password: string,
        stored: IMpcPasswordHash,
    ): Promise<boolean> => {
        const expected = Buffer.from(stored.hash, 'hex');
        const actual = await this.deriveScrypt(
            password,
            Buffer.from(stored.salt, 'hex'),
        );

        if (expected.length !== actual.length) {
            return false;
        }

        return timingSafeEqual(expected, actual);
    };

    /**
     * Returns a random identifier (hex).
     */
    randomId = (bytes = 16): string => randomBytes(bytes).toString('hex');

    /**
     * Returns a random 32-bytes token (hex), used for session cookies.
     */
    randomToken = (): string => randomBytes(32).toString('hex');

    /**
     * SHA-256 hex digest, used to store session tokens hashed.
     */
    sha256 = (value: string): string =>
        createHash('sha256').update(value).digest('hex');

    /**
     * Generates a random AES-256 key (hex), useful to generate MPC_POC_SERVER_KEY.
     */
    generateServerKey = (): string =>
        randomBytes(AES_KEY_BYTES).toString('hex');

    private deriveScrypt = (password: string, salt: Buffer): Promise<Buffer> =>
        new Promise((resolve, reject) => {
            scryptCallback(
                Buffer.from(password.normalize('NFKC'), 'utf8'),
                salt,
                SCRYPT_KEY_LENGTH,
                SCRYPT_OPTIONS,
                (error, derivedKey) =>
                    error != null ? reject(error) : resolve(derivedKey),
            );
        });
}

export const serverCrypto = new ServerCrypto();
