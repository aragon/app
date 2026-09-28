import { parseUnits as viemParseUnits } from 'viem';

class BigIntUtils {
    private readonly scientificNotationRegex =
        /^([+-]?)(\d+\.?\d*)[eE]([+-]?\d+)$/;
    private readonly hexNotationRegex = /^0[xX][0-9a-fA-F]+$/;

    /**
     * Largest exponent the scientific path will raise 10 to. The exponent drives a
     * `10n ** n` allocation, so "1e100000000" would build a 100-million-digit BigInt and
     * block the thread for seconds. Amounts that exist on chain stay far below it: uint256
     * tops out near 1e77, and a token amount shifted by its decimals adds at most ~1e18.
     */
    private readonly maxScientificExponent = 1024;

    /**
     * Safely converts a value to BigInt, handling floating-point representations
     * (e.g. "10000000000000000000000000.0") and scientific notation (e.g. "1e+25")
     * that can come from external APIs like CoinGecko or EVM explorers.
     *
     * On-chain values (token supply, voting power, block numbers, etc.) are always
     * integers, so any fractional part is truncated towards zero. A scientific value whose
     * exponent exceeds `maxScientificExponent` counts as malformed and returns the fallback,
     * where `parseUnits` throws instead — no on-chain value comes near that magnitude.
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
     * are truncated towards zero. Any other malformed value still throws, like viem does —
     * including an exponent too large to stand for a real amount, which viem rejects rather
     * than this returning a silent zero.
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
        const shifted = this.scientificToBigInt(
            sign,
            mantissa,
            Number(expStr) + decimals,
        );

        // Out of the range the scientific path serves. Hand the original string to viem so the
        // caller gets its InvalidDecimalNumberError, the same as any other malformed amount.
        return shifted ?? viemParseUnits(str, decimals);
    };

    /**
     * Parses a scientific notation string (e.g. "1.5e+25", "-3e10") directly into BigInt
     * without going through Number, preserving full precision for the significant digits.
     * Returns null when the value is not scientific notation or its exponent is out of range.
     */
    private parseScientificString = (str: string): bigint | null => {
        const match = str.match(this.scientificNotationRegex);
        if (!match) {
            return null;
        }

        const [, sign, mantissa, expStr] = match;

        return this.scientificToBigInt(sign, mantissa, Number(expStr));
    };

    /**
     * Raises the mantissa by the given exponent with full precision, truncating a fractional
     * result towards zero. Takes the exponent as a number rather than re-reading it from a
     * string: `String(1e21)` is "1e+21", which no longer parses as an exponent. Returns null
     * for an exponent outside `maxScientificExponent`, which stands for no real amount and
     * whose `10n ** n` would cost seconds of main thread.
     */
    private scientificToBigInt = (
        sign: string,
        mantissa: string,
        exponent: number,
    ): bigint | null => {
        const dotIndex = mantissa.indexOf('.');
        const fracLength = dotIndex >= 0 ? mantissa.length - dotIndex - 1 : 0;
        const digits = mantissa.replace('.', '');

        const adjustedExp = exponent - fracLength;

        if (
            !Number.isSafeInteger(adjustedExp) ||
            Math.abs(adjustedExp) > this.maxScientificExponent
        ) {
            return null;
        }

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
