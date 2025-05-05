import { pluginVersionUtils } from '@/shared/utils/pluginVersionUtils';

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

        it('returns false if current is undefined', () => {
            expect(pluginVersionUtils.isLessThan(undefined, { release: 0, build: 1 })).toBe(false);
        });

        it('returns false if target is undefined', () => {
            expect(pluginVersionUtils.isLessThan({ release: 1, build: 3 }, undefined)).toBe(false);
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

        it('returns false if current is undefined', () => {
            expect(pluginVersionUtils.isGreaterThan(undefined, { release: 0, build: 1 })).toBe(false);
        });

        it('returns false if target is undefined', () => {
            expect(pluginVersionUtils.isGreaterThan({ release: 1, build: 3 }, undefined)).toBe(false);
        });
    });

    describe('isGreaterOrEqualTo', () => {
        it('returns true when current > target build', () => {
            const current = { release: 1, build: 4 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterOrEqualTo(current, target)).toBe(true);
        });

        it('returns true when current > target release', () => {
            const current = { release: 2, build: 0 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterOrEqualTo(current, target)).toBe(true);
        });

        it('returns true when current === target', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterOrEqualTo(current, target)).toBe(true);
        });

        it('returns false when current < target build', () => {
            const current = { release: 1, build: 2 };
            const target = { release: 1, build: 3 };

            expect(pluginVersionUtils.isGreaterOrEqualTo(current, target)).toBe(false);
        });

        it('returns false if current is undefined', () => {
            expect(pluginVersionUtils.isGreaterOrEqualTo(undefined, { release: 0, build: 1 })).toBe(false);
        });

        it('returns false if target is undefined', () => {
            expect(pluginVersionUtils.isGreaterOrEqualTo({ release: 1, build: 3 }, undefined)).toBe(false);
        });
    });
});
