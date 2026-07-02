import { stringUtils } from './stringUtils';

describe('stringUtils', () => {
    describe('isNonEmptyString', () => {
        it.each([
            { value: 'hello', expected: true },
            { value: ' ', expected: true },
            { value: '', expected: false },
            { value: undefined, expected: false },
            { value: null, expected: false },
            { value: 0, expected: false },
            { value: 42, expected: false },
            { value: [], expected: false },
            { value: {}, expected: false },
        ])('returns $expected for $value', ({ value, expected }) => {
            expect(stringUtils.isNonEmptyString(value)).toBe(expected);
        });
    });

    describe('toPascalCase', () => {
        it.each([
            { value: 'execute-selector', expected: 'ExecuteSelector' },
            { value: 'voting-power', expected: 'VotingPower' },
            { value: 'snake_case_value', expected: 'SnakeCaseValue' },
            { value: 'already Pascal', expected: 'AlreadyPascal' },
            { value: 'single', expected: 'Single' },
            { value: '', expected: '' },
        ])('converts "$value" to "$expected"', ({ value, expected }) => {
            expect(stringUtils.toPascalCase(value)).toBe(expected);
        });
    });
});
