import { safeBigIntUtils } from './safeBigIntUtils';

describe('safeBigIntUtils', () => {
    describe('toBigInt', () => {
        it('returns null for nullish values', () => {
            expect(safeBigIntUtils.toBigInt(null)).toBeNull();
            expect(safeBigIntUtils.toBigInt(undefined)).toBeNull();
        });

        it('returns bigint values unchanged', () => {
            expect(safeBigIntUtils.toBigInt(123n)).toBe(123n);
        });

        it('parses integer-like strings', () => {
            expect(safeBigIntUtils.toBigInt('1000')).toBe(1000n);
            expect(safeBigIntUtils.toBigInt('0010')).toBe(10n);
        });

        it('parses decimal strings with zero-only fraction', () => {
            expect(safeBigIntUtils.toBigInt('100.0')).toBe(100n);
            expect(safeBigIntUtils.toBigInt('100.000')).toBe(100n);
            expect(
                safeBigIntUtils.toBigInt('10000000000000000000000000.0'),
            ).toBe(10000000000000000000000000n);
        });

        it('returns null for non-integer decimal strings', () => {
            expect(safeBigIntUtils.toBigInt('100.1')).toBeNull();
            expect(safeBigIntUtils.toBigInt('0.01')).toBeNull();
        });

        it('parses integer numbers and rejects non-integer numbers', () => {
            expect(safeBigIntUtils.toBigInt(42)).toBe(42n);
            expect(safeBigIntUtils.toBigInt(42.5)).toBeNull();
        });

        it('returns null for non-numeric strings', () => {
            expect(safeBigIntUtils.toBigInt('')).toBeNull();
            expect(safeBigIntUtils.toBigInt('abc')).toBeNull();
            expect(safeBigIntUtils.toBigInt('123abc')).toBeNull();
        });
    });
});
