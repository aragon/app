import { preparePolicyDialogUtils } from './preparePolicyDialogUtils';

describe('preparePolicyDialogUtils', () => {
    describe('normalizeRatios', () => {
        it('normalizes equal values to equal ratios and sum equals 1,000,000', () => {
            const values = [1, 1, 1];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            // With 3 equal values, remainder of 1 is distributed to first value
            expect(result).toEqual([333334, 333333, 333333]);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(1000000);
        });

        it('normalizes values proportionally to 1,000,000 base', () => {
            const values = [50, 30, 20];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([500000, 300000, 200000]);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(1000000);
        });

        it('handles decimal values and rounds correctly', () => {
            const values = [0.33, 0.33, 0.34];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            // 0.33/1 * 1000000 = 330000, 0.34/1 * 1000000 = 340000
            expect(result).toEqual([330000, 330000, 340000]);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(1000000);
        });

        it('handles single value', () => {
            const values = [123];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([1000000]);
        });

        it('handles small fractional values', () => {
            const values = [0.001, 0.002, 0.003];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([166667, 333333, 500000]);
        });

        it('handles large values proportionally', () => {
            const values = [1000000, 2000000, 3000000];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([166667, 333333, 500000]);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(1000000);
        });

        it('handles percentage-like values correctly', () => {
            const values = [0.45, 0.3, 0.25];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([450000, 300000, 250000]);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(1000000);
        });

        it('throws error for empty array', () => {
            expect(() => preparePolicyDialogUtils.normalizeRatios([])).toThrow('Cannot normalize ratios: empty array');
        });

        it('throws error for zero sum', () => {
            expect(() => preparePolicyDialogUtils.normalizeRatios([0, 0, 0])).toThrow(
                'Cannot normalize ratios: sum of values is zero',
            );
        });

        it('throws error for negative values', () => {
            expect(() => preparePolicyDialogUtils.normalizeRatios([10, -5, 15])).toThrow(
                'Cannot normalize ratios: negative values not allowed',
            );
        });

        it('ensures sum is always exactly 1,000,000', () => {
            // Test various edge cases that could cause rounding issues
            const testCases = [
                [1, 1, 1],
                [1, 2, 3],
                [33, 33, 34],
                [7, 11, 13],
                [1, 1, 1, 1],
                [10, 20, 30, 40],
            ];

            testCases.forEach((values) => {
                const result = preparePolicyDialogUtils.normalizeRatios(values);
                const sum = result.reduce((acc, val) => acc + val, 0);
                expect(sum).toBe(1000000);
            });
        });

        it('distributes remainder to largest fractional parts', () => {
            // 1/3 of 1M = 333333.333... (fractional part: 0.333...)
            const values = [1, 1, 1];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            // All have equal fractional parts, so remainder goes to first element
            expect(result[0]).toBeGreaterThanOrEqual(333333);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(1000000);
        });
    });
});
