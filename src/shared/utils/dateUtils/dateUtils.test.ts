import { DateTime } from 'luxon';
import { dateUtils } from './dateUtils';

describe('dateUtils', () => {
    describe('secondsToDuration', () => {
        test.each([
            { seconds: 0, result: {} },
            { seconds: 60, result: { minutes: 1 } },
            { seconds: 3600, result: { hours: 1 } },
            { seconds: 86400, result: { days: 1 } },
            { seconds: 2 * 86400 + 3 * 3600 + 45 * 60, result: { days: 2, hours: 3, minutes: 45 } },
            { seconds: 100 * 86400 + 23 * 3600 + 59 * 60, result: { days: 100, hours: 23, minutes: 59 } },
        ])('correctly converts $seconds seconds', ({ seconds, result }) => {
            const expectedResult = { days: 0, hours: 0, minutes: 0, ...result };
            expect(dateUtils.secondsToDuration(seconds)).toEqual(expectedResult);
        });
    });

    describe('durationToSeconds', () => {
        test.each([
            { days: 0, hours: 0, minutes: 0, result: 0 },
            { days: 1, hours: 0, minutes: 0, result: 86400 },
            { days: 0, hours: 1, minutes: 0, result: 3600 },
            { days: 0, hours: 0, minutes: 1, result: 60 },
            { days: 10, hours: 2, minutes: 55, result: 874500 },
        ])(
            'correctly converts $days days, $hours hours, $minutes minutes to $result seconds',
            ({ days, hours, minutes, result }) => {
                const duration = { days, hours, minutes };
                expect(dateUtils.durationToSeconds(duration)).toEqual(result);
            },
        );
    });

    describe('parseFixedDate', () => {
        test('parses valid date and time correctly', () => {
            const result = dateUtils.parseFixedDate({ date: '2024-09-06', time: '14:30' });
            expect(result.toISO()).toBe('2024-09-06T14:30:00.000+00:00');
        });
    });

    describe('dateToFixedDate', () => {
        test('converts DateTime to IDateFixed correctly', () => {
            const date = DateTime.fromISO('2024-09-06T14:30:00.000Z');
            const result = dateUtils.dateToFixedDate(date);
            expect(result).toEqual({ date: '2024-09-06', time: '14:30' });
        });

        test('returns null for invalid DateTime', () => {
            const invalidDate = DateTime.invalid('invalid date');
            const result = dateUtils.dateToFixedDate(invalidDate);
            expect(result).toBeNull();
        });
    });

    describe('validateDuration', () => {
        test('returns true when no minDuration is provided', () => {
            const result = dateUtils.validateDuration({ value: { days: 0, hours: 2, minutes: 0 } });
            expect(result).toBe(true);
        });

        test('returns true when value is greater than minDuration', () => {
            const result = dateUtils.validateDuration({
                value: { days: 0, hours: 3, minutes: 0 },
                minDuration: { days: 0, hours: 2, minutes: 0 },
            });
            expect(result).toBe(true);
        });

        test('returns false when value is less than minDuration', () => {
            const result = dateUtils.validateDuration({
                value: { days: 0, hours: 1, minutes: 0 },
                minDuration: { days: 0, hours: 2, minutes: 0 },
            });
            expect(result).toBe(false);
        });

        test('returns true when value equals minDuration', () => {
            const result = dateUtils.validateDuration({
                value: { days: 0, hours: 2, minutes: 0 },
                minDuration: { days: 0, hours: 2, minutes: 0 },
            });
            expect(result).toBe(true);
        });
    });

    describe('validateFixedTime', () => {
        const minTime = DateTime.fromISO('2024-09-06T10:00:00.000Z');

        test('returns false for empty date or time', () => {
            expect(dateUtils.validateFixedTime({ value: { date: '', time: '10:00' }, minTime })).toBe(false);
            expect(dateUtils.validateFixedTime({ value: { date: '2024-09-06', time: '' }, minTime })).toBe(false);
        });

        test('returns true when value is after minTime', () => {
            const result = dateUtils.validateFixedTime({
                value: { date: '2024-09-06', time: '11:00' },
                minTime,
            });
            expect(result).toBe(true);
        });

        test('returns false when value is before minTime', () => {
            const result = dateUtils.validateFixedTime({
                value: { date: '2024-09-06', time: '09:00' },
                minTime,
            });
            expect(result).toBe(false);
        });

        test('returns true when value is after minTime plus minDuration', () => {
            const result = dateUtils.validateFixedTime({
                value: { date: '2024-09-06', time: '13:00' },
                minTime,
                minDuration: { days: 0, hours: 2, minutes: 0 },
            });
            expect(result).toBe(true);
        });

        test('returns false when value is before minTime plus minDuration', () => {
            const result = dateUtils.validateFixedTime({
                value: { date: '2024-09-06', time: '11:00' },
                minTime,
                minDuration: { days: 0, hours: 2, minutes: 0 },
            });
            expect(result).toBe(false);
        });
    });

    describe('compareDuration', () => {
        it('returns true when time durations are equal', () => {
            const first = { days: 4, hours: 0, minutes: 2 };
            const second = { days: 4, hours: 0, minutes: 2 };
            expect(dateUtils.compareDuration(first, second)).toBeTruthy();
        });

        it.each([
            { durationOne: { days: 1, hours: 10, minutes: 3 }, durationTwo: { days: 1, hours: 10, minutes: 2 } },
            { durationOne: { days: 1, hours: 10, minutes: 3 }, durationTwo: { days: 1, hours: 0, minutes: 3 } },
            { durationOne: { days: 1, hours: 10, minutes: 3 }, durationTwo: { days: 10, hours: 10, minutes: 3 } },
            { durationOne: { days: 1, hours: 10, minutes: 3 }, durationTwo: undefined },
            { durationOne: undefined, durationTwo: { days: 1, hours: 10, minutes: 3 } },
        ])('returns false when time durations are not equal', ({ durationOne, durationTwo }) => {
            expect(dateUtils.compareDuration(durationOne, durationTwo)).toBeFalsy();
        });
    });
});
