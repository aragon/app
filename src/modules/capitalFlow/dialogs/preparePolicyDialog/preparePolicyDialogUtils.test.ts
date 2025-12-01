import { preparePolicyDialogUtils } from './preparePolicyDialogUtils';

describe('preparePolicyDialogUtils', () => {
    describe('normalizeRatios', () => {
        it('normalizes equal values to equal ratios', () => {
            const values = [1, 1, 1];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([333333, 333333, 333333]);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(999999);
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
            const values = [100];
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
    });
});
