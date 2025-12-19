import { preparePolicyDialogUtils } from './preparePolicyDialogUtils';

describe('preparePolicyDialogUtils', () => {
    describe('normalizeRatios', () => {
        it('normalizes equal values to equal ratios', () => {
            const values = [1, 1];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([500_000, 500_000]);
        });

        it('normalizes values proportionally to 1,000,000 base', () => {
            const values = [50, 30, 20];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([500_000, 300_000, 200_000]);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(
                1_000_000,
            );
        });

        it('handles single value', () => {
            const values = [123];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([1_000_000]);
        });

        it('handles small fractional values', () => {
            const values = [0.001, 0.002, 0.003];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([166_667, 333_333, 500_000]);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(
                1_000_000,
            );
        });

        it('handles large values proportionally', () => {
            const values = [1_000_000, 2_000_000, 3_000_000];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([166_667, 333_333, 500_000]);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(
                1_000_000,
            );
        });

        it('handles percentage-like values correctly', () => {
            const values = [0.45, 0.3, 0.25];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result).toEqual([450_000, 300_000, 250_000]);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(
                1_000_000,
            );
        });

        it('distributes remainder to maintain exact sum', () => {
            const values = [1, 1, 1];
            const result = preparePolicyDialogUtils.normalizeRatios(values);

            expect(result[0]).toBe(333_334);
            expect(result[1]).toBe(333_333);
            expect(result[2]).toBe(333_333);
            expect(result.reduce((sum, value) => sum + value, 0)).toBe(
                1_000_000,
            );
        });
    });
});
