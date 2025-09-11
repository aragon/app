import { numberProgressInputUtils } from './numberProgressInputUtils';

const { toFullDecimalString } = numberProgressInputUtils;

describe('numberProgressInputUtils', () => {
    describe('toFullDecimalString', () => {
        it('returns string representation for numbers not in scientific notation', () => {
            expect(toFullDecimalString(0)).toBe('0');
            expect(toFullDecimalString(123)).toBe('123');
            expect(toFullDecimalString(123.456)).toBe('123.456');
            expect(toFullDecimalString(-123.456)).toBe('-123.456');
            expect(toFullDecimalString(0.5)).toBe('0.5');
            expect(toFullDecimalString(0.000001)).toBe('0.000001');
            expect(toFullDecimalString(0.00000001)).toBe('0.00000001');
        });

        it('returns string representation for large numbers not in scientific notation', () => {
            expect(toFullDecimalString(1000000000)).toBe('1000000000');
            expect(toFullDecimalString(-100000000)).toBe('-100000000');
        });

        it('converts positive scientific notation to full decimal string', () => {
            expect(toFullDecimalString(1.23e-7)).toBe('0.000000123');
            expect(toFullDecimalString(5e-3)).toBe('0.005');
            expect(toFullDecimalString(1e-1)).toBe('0.1');
            expect(toFullDecimalString(7.89e-5)).toBe('0.0000789');
        });

        it('converts negative scientific notation to full decimal string', () => {
            expect(toFullDecimalString(-1.23e-7)).toBe('-0.000000123');
            expect(toFullDecimalString(-5e-3)).toBe('-0.005');
            expect(toFullDecimalString(-1e-1)).toBe('-0.1');
            expect(toFullDecimalString(-7.89e-5)).toBe('-0.0000789');
        });

        it('handles scientific notation with single digit mantissa', () => {
            expect(toFullDecimalString(1e-5)).toBe('0.00001');
            expect(toFullDecimalString(9e-3)).toBe('0.009');
            expect(toFullDecimalString(-2e-4)).toBe('-0.0002');
        });

        it('handles scientific notation with multiple decimal places in mantissa', () => {
            expect(toFullDecimalString(1.234567e-8)).toBe('0.00000001234567');
            expect(toFullDecimalString(-9.876543e-6)).toBe('-0.000009876543');
        });

        it('does not convert positive scientific notation (e+)', () => {
            const largeNumber = 1.23e7;
            expect(toFullDecimalString(largeNumber)).toBe(largeNumber.toString());
        });
    });
});
