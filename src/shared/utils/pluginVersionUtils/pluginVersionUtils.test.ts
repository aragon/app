import { pluginVersionUtils } from './pluginVersionUtils';

describe('pluginVersion Utils', () => {
    describe('isLessThan', () => {
        it('returns true when current < target build', () => {
            const current = { release: 1, build: 2 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isLessThan(current, target)).toBe(true);
        });

        it('returns true when current < target release', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 2, build: 0 };

            expect(pluginVersionUtils.isLessThan(current, target)).toBe(true);
        });

        it('returns false when current === target', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isLessThan(current, target)).toBe(false);
        });

        it('returns false when current > target build', () => {
            const current = { release: 1, build: 4 };
            const target = { release: 1, build: 3 };
            expect(pluginVersionUtils.isLessThan(current, target)).toBe(false);
        });

        it('handles undefined as 0.0 and returns false', () => {
            expect(pluginVersionUtils.isLessThan(undefined, { release: 0, build: 1 })).toBe(true);
        });
    });

    describe('isGreaterThan', () => {
        it('returns true when current > target build', () => {
            const current = { release: 1, build: 4 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterThan(current, target)).toBe(true);
        });

        it('returns true when current > target release', () => {
            const current = { release: 2, build: 0 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterThan(current, target)).toBe(true);
        });

        it('returns false when current === target', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterThan(current, target)).toBe(false);
        });

        it('returns false when current < target build', () => {
            const current = { release: 1, build: 2 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterThan(current, target)).toBe(false);
        });

        it('handles undefined as 0.0 and returns true', () => {
            expect(pluginVersionUtils.isGreaterThan({ release: 0, build: 1 }, undefined)).toBe(true);
        });
    });

    describe('isGreaterThanOrEqual', () => {
        it('returns true when current > target build', () => {
            const current = { release: 1, build: 4 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterThanOrEqual(current, target)).toBe(true);
        });

        it('returns true when current > target release', () => {
            const current = { release: 2, build: 0 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterThanOrEqual(current, target)).toBe(true);
        });

        it('returns true when current === target', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterThanOrEqual(current, target)).toBe(true);
        });

        it('returns false when current < target build', () => {
            const current = { release: 1, build: 2 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterThanOrEqual(current, target)).toBe(false);
        });

        it('handles undefined as 0.0 and returns false', () => {
            expect(pluginVersionUtils.isGreaterThanOrEqual(undefined, { release: 0, build: 1 })).toBe(false);
        });
    });
});
