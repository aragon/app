import { parseUnits as viemParseUnits } from 'viem';

class BigIntUtils {
    private readonly scientificNotationRegex =
        /^([+-]?)(\d+\.?\d*)[eE]([+-]?\d+)$/;
    private readonly hexNotationRegex = /^0[xX][0-9a-fA-F]+$/;

    /**
     * Safely converts a value to BigInt, handling floating-point representations
     * (e.g. "10000000000000000000000000.0") and scientific notation (e.g. "1e+25")
     * that can come from external APIs like CoinGecko or EVM explorers.
     *
     * On-chain values (token supply, voting power, block numbers, etc.) are always
     * integers, so any fractional part is truncated towards zero.
     */
    safeParse = (
        value: string | number | bigint | null | undefined,
        fallback: bigint = BigInt(0),
    ): bigint => {
        if (value == null) {
            return fallback;
        }
        if (typeof value === 'bigint') {
            return value;
        }

        if (typeof value === 'number') {
            if (!Number.isFinite(value)) {
                return fallback;
            }
            return BigInt(Math.trunc(value));
        }

        const str = value.trim();
        if (str === '') {
            return fallback;
        }

        const scientificValue = this.parseScientificString(str);
        if (scientificValue != null) {
            return scientificValue;
        }
        if (/[eE]/.test(str) && !this.hexNotationRegex.test(str)) {
            return fallback;
        }

        const integerPart = str.split('.')[0];

        try {
            return BigInt(integerPart);
        } catch {
            return fallback;
        }
    };

    /**
     * Converts a human-readable token amount to base units like viem's `parseUnits`, but
     * tolerant of the strings a form field can hold: an empty value counts as zero, and
     * scientific notation (what a Number-to-string conversion produces for very small or very
     * large amounts, e.g. "5.6e-10") is shifted by `decimals` and parsed with full precision
     * instead of throwing InvalidDecimalNumberError mid-render. Fractions finer than `decimals`
     * are truncated towards zero. Any other malformed value still throws, like viem does.
     */
    parseUnits = (
        value: string | null | undefined,
        decimals: number,
    ): bigint => {
        const str = value?.trim() ?? '';

        if (str === '') {
            return BigInt(0);
        }

        const match = str.match(this.scientificNotationRegex);

        if (match == null) {
            return viemParseUnits(str, decimals);
        }

        const [, sign, mantissa, expStr] = match;

        return this.safeParse(
            `${sign}${mantissa}e${Number(expStr) + decimals}`,
        );
    };

    /**
     * Parses a scientific notation string (e.g. "1.5e+25", "-3e10") directly into BigInt
     * without going through Number, preserving full precision for the significant digits.
     */
    private parseScientificString = (str: string): bigint | null => {
        const match = str.match(this.scientificNotationRegex);
        if (!match) {
            return null;
        }

        const [, sign, mantissa, expStr] = match;
        const exp = Number(expStr);

        const dotIndex = mantissa.indexOf('.');
        const fracLength = dotIndex >= 0 ? mantissa.length - dotIndex - 1 : 0;
        const digits = mantissa.replace('.', '');

        const adjustedExp = exp - fracLength;

        try {
            const significand = BigInt((sign === '-' ? '-' : '') + digits);

            if (adjustedExp >= 0) {
                return significand * BigInt(10) ** BigInt(adjustedExp);
            }

            // Fractional result — truncate towards zero
            const divisor = BigInt(10) ** BigInt(-adjustedExp);
            return significand / divisor;
        } catch {
            return null;
        }
    };
}

export const bigIntUtils = new BigIntUtils();
