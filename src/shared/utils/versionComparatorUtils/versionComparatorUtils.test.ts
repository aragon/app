import { versionComparatorUtils } from './versionComparatorUtils';

describe('versionComparator Utils', () => {
    describe('isLessThan', () => {
        it('returns true when current < target build', () => {
            const current = { release: 1, build: 2 };
            const target = { release: 1, build: 3 };

            expect(versionComparatorUtils.isLessThan(current, target)).toBe(true);
        });

        it('returns true when current < target release', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 2, build: 0 };

            expect(versionComparatorUtils.isLessThan(current, target)).toBe(true);
        });

        it('returns false when current === target', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 1, build: 3 };

            expect(versionComparatorUtils.isLessThan(current, target)).toBe(false);
        });

        it('returns false when current > target build', () => {
            const current = { release: 1, build: 4 };
            const target = { release: 1, build: 3 };
            expect(versionComparatorUtils.isLessThan(current, target)).toBe(false);
        });

        it('returns false if current is undefined', () => {
            expect(versionComparatorUtils.isLessThan(undefined, { release: 0, build: 1 })).toBe(false);
        });

        it('returns false if target is undefined', () => {
            expect(versionComparatorUtils.isLessThan({ release: 1, build: 3 }, undefined)).toBe(false);
        });
    });

    describe('isGreaterThan', () => {
        it('returns true when current > target build', () => {
            const current = { release: 1, build: 4 };
            const target = { release: 1, build: 3 };

            expect(versionComparatorUtils.isGreaterThan(current, target)).toBe(true);
        });

        it('returns true when current > target release', () => {
            const current = { release: 2, build: 0 };
            const target = { release: 1, build: 3 };

            expect(versionComparatorUtils.isGreaterThan(current, target)).toBe(true);
        });

        it('returns false when current === target', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 1, build: 3 };

            expect(versionComparatorUtils.isGreaterThan(current, target)).toBe(false);
        });

        it('returns false when current < target build', () => {
            const current = { release: 1, build: 2 };
            const target = { release: 1, build: 3 };

            expect(versionComparatorUtils.isGreaterThan(current, target)).toBe(false);
        });

        it('returns false if current is undefined', () => {
            expect(versionComparatorUtils.isGreaterThan(undefined, { release: 0, build: 1 })).toBe(false);
        });

        it('returns false if target is undefined', () => {
            expect(versionComparatorUtils.isGreaterThan({ release: 1, build: 3 }, undefined)).toBe(false);
        });
    });

    describe('isGreaterOrEqualTo', () => {
        it('returns true when current > target build', () => {
            const current = { release: 1, build: 4 };
            const target = { release: 1, build: 3 };

            expect(versionComparatorUtils.isGreaterOrEqualTo(current, target)).toBe(true);
        });

        it('returns true when current > target release', () => {
            const current = { release: 2, build: 0 };
            const target = { release: 1, build: 3 };

            expect(versionComparatorUtils.isGreaterOrEqualTo(current, target)).toBe(true);
        });

        it('returns true when current === target', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 1, build: 3 };

            expect(versionComparatorUtils.isGreaterOrEqualTo(current, target)).toBe(true);
        });

        it('returns false when current < target build', () => {
            const current = { release: 1, build: 2 };
            const target = { release: 1, build: 3 };

            expect(versionComparatorUtils.isGreaterOrEqualTo(current, target)).toBe(false);
        });

        it('returns false if current is undefined', () => {
            expect(versionComparatorUtils.isGreaterOrEqualTo(undefined, { release: 0, build: 1 })).toBe(false);
        });

        it('returns false if target is undefined', () => {
            expect(versionComparatorUtils.isGreaterOrEqualTo({ release: 1, build: 3 }, undefined)).toBe(false);
        });
    });
});
