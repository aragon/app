import { DateTime } from 'luxon';
import { dateUtils } from './dateUtils';

describe('dateUtils', () => {
    describe('secondsToDaysHoursMinutes', () => {
        test('converts 0 seconds correctly', () => {
            expect(dateUtils.secondsToDaysHoursMinutes(0)).toEqual({ days: 0, hours: 0, minutes: 0 });
        });

        test('converts 60 seconds to 1 minute', () => {
            expect(dateUtils.secondsToDaysHoursMinutes(60)).toEqual({ days: 0, hours: 0, minutes: 1 });
        });

        test('converts 3600 seconds to 1 hour', () => {
            expect(dateUtils.secondsToDaysHoursMinutes(3600)).toEqual({ days: 0, hours: 1, minutes: 0 });
        });

        test('converts 86400 seconds to 1 day', () => {
            expect(dateUtils.secondsToDaysHoursMinutes(86400)).toEqual({ days: 1, hours: 0, minutes: 0 });
        });

        test('converts a complex time correctly', () => {
            const seconds = 2 * 86400 + 3 * 3600 + 45 * 60;
            expect(dateUtils.secondsToDaysHoursMinutes(seconds)).toEqual({ days: 2, hours: 3, minutes: 45 });
        });

        test('handles large numbers of seconds', () => {
            const seconds = 100 * 86400 + 23 * 3600 + 59 * 60;
            expect(dateUtils.secondsToDaysHoursMinutes(seconds)).toEqual({ days: 100, hours: 23, minutes: 59 });
        });
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
});
