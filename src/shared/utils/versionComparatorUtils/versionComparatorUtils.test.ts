import { versionComparatorUtils } from './versionComparatorUtils';

describe('versionComparator Utils', () => {
    describe('isLessThan', () => {
        it.each([
            { current: { release: 1, build: 2 }, target: { release: 1, build: 3 }, result: true },
            { current: { release: 1, build: 3 }, target: { release: 2, build: 0 }, result: true },
            { current: { release: 1, build: 3, patch: 1 }, target: { release: 2, build: 0, patch: 2 }, result: true },
            { current: { release: 1, build: 3 }, target: { release: 1, build: 3 }, result: false },
            { current: { release: 1, build: 4 }, target: { release: 1, build: 3 }, result: false },
            { current: undefined, target: { release: 0, build: 1 }, result: false },
            { current: { release: 1, build: 3 }, target: undefined, result: false },
            { current: undefined, target: undefined, result: false },
        ])('returns $result for versions $current and $target', ({ current, target, result }) => {
            expect(versionComparatorUtils.isLessThan(current, target)).toEqual(result);
        });
    });

    describe('isGreaterThan', () => {
        it.each([
            { current: { release: 1, build: 4 }, target: { release: 1, build: 3 }, result: true },
            { current: { release: 2, build: 0 }, target: { release: 1, build: 3 }, result: true },
            { current: { release: 1, build: 3, patch: 3 }, target: { release: 1, build: 3, patch: 1 }, result: true },
            { current: { release: 1, build: 3 }, target: { release: 1, build: 3 }, result: false },
            { current: { release: 1, build: 2 }, target: { release: 1, build: 3 }, result: false },
            { current: undefined, target: { release: 0, build: 1 }, result: false },
            { current: { release: 1, build: 3 }, target: undefined, result: false },
            { current: undefined, target: undefined, result: false },
        ])('returns $result for versions $current and $target', ({ current, target, result }) => {
            expect(versionComparatorUtils.isGreaterThan(current, target)).toEqual(result);
        });
    });

    describe('isGreaterOrEqualTo', () => {
        it.each([
            { current: { release: 1, build: 4 }, target: { release: 1, build: 3 }, result: true },
            { current: { release: 2, build: 0 }, target: { release: 1, build: 3 }, result: true },
            { current: { release: 1, build: 3, patch: 1 }, target: { release: 1, build: 3, patch: 1 }, result: true },
            { current: { release: 1, build: 2 }, target: { release: 1, build: 3 }, result: false },
            { current: undefined, target: { release: 0, build: 1 }, result: false },
            { current: { release: 1, build: 3 }, target: undefined, result: false },
            { current: undefined, target: undefined, result: false },
        ])('returns $result for versions $current and $target', ({ current, target, result }) => {
            expect(versionComparatorUtils.isGreaterOrEqualTo(current, target)).toEqual(result);
        });
    });

    describe('normaliseComparatorInput', () => {
        it('returns undefined when input is not defined', () => {
            expect(versionComparatorUtils.normaliseComparatorInput(undefined)).toBeUndefined();
        });

        it.each([
            { value: '1.2.0', result: { release: 1, build: 2, patch: 0 } },
            { value: '2.10', result: { release: 2, build: 10 } },
        ])('correctly normalises $value string input', ({ value, result }) => {
            expect(versionComparatorUtils.normaliseComparatorInput(value)).toEqual(result);
        });

        it.each([
            { value: { release: '1', build: '2', patch: '0' }, result: { release: 1, build: 2, patch: 0 } },
            { value: { release: '3', build: '10' }, result: { release: 3, build: 10 } },
        ])('correctly normalises $value version input', ({ value, result }) => {
            expect(versionComparatorUtils.normaliseComparatorInput(value)).toEqual(result);
        });
    });
});
