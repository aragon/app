import type { Hex } from 'viem';

/**
 * POC / mock: Shamir secret sharing over the prime field of the secp256k1 curve order.
 * Used to split a private key in 2-of-3 shares (device / server / recovery). The math is real but a
 * production system should use a threshold signature scheme (TSS) so the full key is never reconstructed.
 */

export interface IShamirShare {
    /**
     * Share index (x coordinate), 1..n.
     */
    index: number;
    /**
     * Share value (y coordinate) in the field.
     */
    value: bigint;
}

// Order of the secp256k1 curve (prime), used as the field modulus.
export const SECP256K1_ORDER = BigInt(
    '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141',
);

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);

const mod = (value: bigint, modulus: bigint = SECP256K1_ORDER): bigint => {
    const result = value % modulus;

    return result >= ZERO ? result : result + modulus;
};

const modPow = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
    let result = ONE;
    let currentBase = mod(base, modulus);
    let currentExponent = exponent;

    while (currentExponent > ZERO) {
        if (currentExponent % TWO === ONE) {
            result = (result * currentBase) % modulus;
        }

        currentBase = (currentBase * currentBase) % modulus;
        currentExponent /= TWO;
    }

    return result;
};

// Fermat inverse (modulus is prime).
const modInverse = (
    value: bigint,
    modulus: bigint = SECP256K1_ORDER,
): bigint => {
    const normalized = mod(value, modulus);

    if (normalized === ZERO) {
        throw new Error('shamir: cannot invert zero');
    }

    return modPow(normalized, modulus - TWO, modulus);
};

const getCrypto = (): Crypto => {
    const webCrypto = globalThis.crypto;

    if (webCrypto?.getRandomValues == null) {
        throw new Error('shamir: WebCrypto getRandomValues is not available');
    }

    return webCrypto;
};

const bytesToBigInt = (bytes: Uint8Array): bigint => {
    let result = ZERO;

    for (const byte of bytes) {
        result = (result << BigInt(8)) + BigInt(byte);
    }

    return result;
};

// Uniform random field element in [0, p) via rejection sampling.
const randomFieldElement = (): bigint => {
    const bytes = new Uint8Array(32);

    // The rejection probability is negligible (p is very close to 2^256).
    while (true) {
        getCrypto().getRandomValues(bytes);
        const candidate = bytesToBigInt(bytes);

        if (candidate < SECP256K1_ORDER) {
            bytes.fill(0);

            return candidate;
        }
    }
};

const evaluatePolynomial = (coefficients: bigint[], x: bigint): bigint => {
    // Horner evaluation, coefficients[0] is the constant term (the secret).
    let result = ZERO;

    for (let i = coefficients.length - 1; i >= 0; i--) {
        result = mod(result * x + coefficients[i]);
    }

    return result;
};

/**
 * Splits the secret in `shares` shares where any `threshold` of them recover the secret.
 */
export const splitSecret = (
    secret: bigint,
    threshold = 2,
    shares = 3,
): IShamirShare[] => {
    if (secret < ZERO || secret >= SECP256K1_ORDER) {
        throw new Error('shamir: secret must be in the field [0, p)');
    }

    if (threshold < 2 || shares < threshold) {
        throw new Error('shamir: invalid threshold / shares parameters');
    }

    const coefficients = [secret];

    for (let i = 1; i < threshold; i++) {
        coefficients.push(randomFieldElement());
    }

    const result: IShamirShare[] = [];

    for (let index = 1; index <= shares; index++) {
        result.push({
            index,
            value: evaluatePolynomial(coefficients, BigInt(index)),
        });
    }

    // Best effort: drop the random coefficients from memory.
    coefficients.fill(ZERO);

    return result;
};

/**
 * Recovers the secret from at least `threshold` shares using Lagrange interpolation at x = 0.
 */
export const combineShares = (shares: IShamirShare[]): bigint => {
    if (shares.length < 2) {
        throw new Error('shamir: at least two shares are required');
    }

    const indexes = shares.map((share) => share.index);

    if (new Set(indexes).size !== indexes.length) {
        throw new Error('shamir: share indexes must be unique');
    }

    let secret = ZERO;

    for (const share of shares) {
        const xi = BigInt(share.index);
        let numerator = ONE;
        let denominator = ONE;

        for (const other of shares) {
            if (other.index === share.index) {
                continue;
            }

            const xj = BigInt(other.index);
            numerator = mod(numerator * mod(ZERO - xj));
            denominator = mod(denominator * mod(xi - xj));
        }

        const lagrange = mod(numerator * modInverse(denominator));
        secret = mod(secret + mod(share.value) * lagrange);
    }

    return secret;
};

/**
 * Encodes a share value as 0x-prefixed 32-byte hex.
 */
export const shareToHex = (share: IShamirShare): Hex =>
    `0x${share.value.toString(16).padStart(64, '0')}`;

/**
 * Decodes a 0x-prefixed hex share value.
 */
export const hexToShare = (index: number, hex: Hex): IShamirShare => {
    if (!/^0x[0-9a-fA-F]{1,64}$/.test(hex)) {
        throw new Error('shamir: invalid share hex');
    }

    return { index, value: BigInt(hex) };
};

export const shamir = {
    splitSecret,
    combineShares,
    shareToHex,
    hexToShare,
};
