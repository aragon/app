import { numberProgressInputUtils } from './numberProgressInputUtils';

describe('numberProgressInputUtils', () => {
    describe('toFullDecimalString', () => {
        it('returns string representation for numbers not in scientific notation', () => {
            expect(numberProgressInputUtils.toFullDecimalString(0)).toBe('0');
            expect(numberProgressInputUtils.toFullDecimalString(123)).toBe('123');
            expect(numberProgressInputUtils.toFullDecimalString(123.456)).toBe('123.456');
            expect(numberProgressInputUtils.toFullDecimalString(-123.456)).toBe('-123.456');
            expect(numberProgressInputUtils.toFullDecimalString(0.5)).toBe('0.5');
        });

        it('returns string representation for large numbers not in scientific notation', () => {
            expect(numberProgressInputUtils.toFullDecimalString(1000000)).toBe('1000000');
            expect(numberProgressInputUtils.toFullDecimalString(-1000000)).toBe('-1000000');
        });

        it('converts positive scientific notation to full decimal string', () => {
            expect(numberProgressInputUtils.toFullDecimalString(1.23e-7)).toBe('0.000000123');
            expect(numberProgressInputUtils.toFullDecimalString(5e-3)).toBe('0.005');
            expect(numberProgressInputUtils.toFullDecimalString(1e-1)).toBe('0.1');
            expect(numberProgressInputUtils.toFullDecimalString(7.89e-5)).toBe('0.0000789');
        });

        it('converts negative scientific notation to full decimal string', () => {
            expect(numberProgressInputUtils.toFullDecimalString(-1.23e-7)).toBe('-0.000000123');
            expect(numberProgressInputUtils.toFullDecimalString(-5e-3)).toBe('-0.005');
            expect(numberProgressInputUtils.toFullDecimalString(-1e-1)).toBe('-0.1');
            expect(numberProgressInputUtils.toFullDecimalString(-7.89e-5)).toBe('-0.0000789');
        });

        it('handles scientific notation with single digit mantissa', () => {
            expect(numberProgressInputUtils.toFullDecimalString(1e-5)).toBe('0.00001');
            expect(numberProgressInputUtils.toFullDecimalString(9e-3)).toBe('0.009');
            expect(numberProgressInputUtils.toFullDecimalString(-2e-4)).toBe('-0.0002');
        });

        it('handles scientific notation with multiple decimal places in mantissa', () => {
            expect(numberProgressInputUtils.toFullDecimalString(1.234567e-8)).toBe('0.00000001234567');
            expect(numberProgressInputUtils.toFullDecimalString(-9.876543e-6)).toBe('-0.000009876543');
        });

        it('handles edge cases with very small exponents', () => {
            expect(numberProgressInputUtils.toFullDecimalString(1e-1)).toBe('0.1');
            expect(numberProgressInputUtils.toFullDecimalString(5e-2)).toBe('0.05');
            expect(numberProgressInputUtils.toFullDecimalString(1.5e-1)).toBe('0.15');
        });

        it('does not convert positive scientific notation (e+)', () => {
            const largeNumber = 1.23e7;
            expect(numberProgressInputUtils.toFullDecimalString(largeNumber)).toBe(largeNumber.toString());
        });

        it('convert to string numbers without e- notation', () => {
            expect(numberProgressInputUtils.toFullDecimalString(0.000001)).toBe("0.000001");
            expect(numberProgressInputUtils.toFullDecimalString(0.00000001)).toBe("0.00000001");
        });
    });
});
