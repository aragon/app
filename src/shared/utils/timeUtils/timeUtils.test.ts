import { timeUtils } from './timeUtils';

describe('timeUtils', () => {
    describe('normalizeTimeValue', () => {
        test('returns empty string unchanged', () => {
            expect(timeUtils.normalizeTimeValue('')).toBe('');
        });

        test('keeps 24-hour values as-is', () => {
            expect(timeUtils.normalizeTimeValue('00:15')).toBe('00:15');
            expect(timeUtils.normalizeTimeValue('23:59')).toBe('23:59');
        });

        test('normalizes AM/PM values to 24-hour format', () => {
            expect(timeUtils.normalizeTimeValue('12:00 AM')).toBe('00:00');
            expect(timeUtils.normalizeTimeValue('1:05 PM')).toBe('13:05');
            expect(timeUtils.normalizeTimeValue('07:07 am')).toBe('07:07');
        });

        test('clamps overflow hours/minutes', () => {
            expect(timeUtils.normalizeTimeValue('25:10')).toBe('23:10');
            expect(timeUtils.normalizeTimeValue('1:99 PM')).toBe('13:59');
        });

        test('returns original value when pattern does not match', () => {
            expect(timeUtils.normalizeTimeValue('invalid')).toBe('invalid');
        });
    });
});
