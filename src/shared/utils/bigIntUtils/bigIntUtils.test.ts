import { bigIntUtils } from './bigIntUtils';

describe('bigIntUtils', () => {
    describe('safeParse', () => {
        // --- Basic conversions ---

        it('converts a plain integer string', () => {
            expect(bigIntUtils.safeParse('123')).toBe(BigInt(123));
        });

        it('converts a large integer string with full precision', () => {
            expect(bigIntUtils.safeParse('10000000000000000000000000')).toBe(
                BigInt('10000000000000000000000000'),
            );
        });

        it('converts a number type', () => {
            expect(bigIntUtils.safeParse(42)).toBe(BigInt(42));
        });

        it('passes through existing bigint', () => {
            expect(bigIntUtils.safeParse(BigInt(100))).toBe(BigInt(100));
        });

        it('converts zero from all types', () => {
            expect(bigIntUtils.safeParse('0')).toBe(BigInt(0));
            expect(bigIntUtils.safeParse(0)).toBe(BigInt(0));
            expect(bigIntUtils.safeParse(BigInt(0))).toBe(BigInt(0));
        });

        it('handles hex strings', () => {
            expect(bigIntUtils.safeParse('0xff')).toBe(BigInt(255));
        });

        // --- Floating-point strings (the original bug) ---

        it('handles ".0" suffix from APIs', () => {
            expect(bigIntUtils.safeParse('10000000000000000000000000.0')).toBe(
                BigInt('10000000000000000000000000'),
            );
        });

        it('truncates fractional digits', () => {
            expect(bigIntUtils.safeParse('999.999')).toBe(BigInt(999));
        });

        // --- Scientific notation strings (precision-preserving) ---

        it('parses positive scientific notation string', () => {
            expect(bigIntUtils.safeParse('1e+25')).toBe(
                BigInt('10000000000000000000000000'),
            );
        });

        it('parses scientific notation with fractional mantissa', () => {
            expect(bigIntUtils.safeParse('1.5e3')).toBe(BigInt(1500));
        });

        it('parses negative scientific notation string', () => {
            expect(bigIntUtils.safeParse('-3e10')).toBe(
                BigInt(-30_000_000_000),
            );
        });

        it('truncates scientific notation that results in a fraction', () => {
            expect(bigIntUtils.safeParse('1.5e0')).toBe(BigInt(1));
        });

        it('handles scientific notation with uppercase E', () => {
            expect(bigIntUtils.safeParse('5E3')).toBe(BigInt(5000));
        });

        // --- Number type: large values (scientific notation internally) ---

        it('converts a large number (>= 1e21) via Math.trunc', () => {
            const result = bigIntUtils.safeParse(1e25);
            expect(result > BigInt(0)).toBe(true);
            expect(result).toBe(BigInt(Math.trunc(1e25)));
        });

        it('handles negative large number', () => {
            expect(bigIntUtils.safeParse(-1e25)).toBe(
                BigInt(Math.trunc(-1e25)),
            );
        });

        // --- Number edge cases ---

        it('returns fallback for NaN', () => {
            expect(bigIntUtils.safeParse(Number.NaN)).toBe(BigInt(0));
        });

        it('returns fallback for Infinity', () => {
            expect(bigIntUtils.safeParse(Number.POSITIVE_INFINITY)).toBe(
                BigInt(0),
            );
        });

        it('returns fallback for -Infinity', () => {
            expect(bigIntUtils.safeParse(Number.NEGATIVE_INFINITY)).toBe(
                BigInt(0),
            );
        });

        it('truncates fractional number towards zero', () => {
            expect(bigIntUtils.safeParse(3.7)).toBe(BigInt(3));
            expect(bigIntUtils.safeParse(-3.7)).toBe(BigInt(-3));
        });

        // --- Null / undefined / empty ---

        it('returns fallback for null', () => {
            expect(bigIntUtils.safeParse(null)).toBe(BigInt(0));
        });

        it('returns fallback for undefined', () => {
            expect(bigIntUtils.safeParse(undefined)).toBe(BigInt(0));
        });

        it('returns fallback for empty string', () => {
            expect(bigIntUtils.safeParse('')).toBe(BigInt(0));
        });

        it('returns fallback for whitespace-only string', () => {
            expect(bigIntUtils.safeParse('   ')).toBe(BigInt(0));
        });

        it('returns custom fallback', () => {
            expect(bigIntUtils.safeParse(null, BigInt(999))).toBe(BigInt(999));
        });

        // --- Negative and whitespace ---

        it('handles negative string', () => {
            expect(bigIntUtils.safeParse('-100')).toBe(BigInt(-100));
        });

        it('trims whitespace', () => {
            expect(bigIntUtils.safeParse('  500  ')).toBe(BigInt(500));
        });

        // --- Invalid input ---

        it('returns fallback for non-numeric strings', () => {
            expect(bigIntUtils.safeParse('abc')).toBe(BigInt(0));
        });

        it('returns fallback for malformed scientific notation', () => {
            expect(bigIntUtils.safeParse('1.2.3e5')).toBe(BigInt(0));
        });
    });
});
