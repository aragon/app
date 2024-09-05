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
            const result = dateUtils.parseFixedDate({ date: '2023-05-15', time: '14:30' });
            expect(result.toISO()).toBe('2023-05-15T14:30:00.000+00:00');
        });
    });
    describe('getStartDate', () => {
        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-09-04T12:00:00Z'));
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        test('returns current time when isNow is true', () => {
            const result = dateUtils.getStartDate({ minDuration: 0, isStart: true });
            expect(result).toEqual({ date: '2024-09-04', time: '12:00' });
        });

        test('uses minDuration when provided', () => {
            const result = dateUtils.getStartDate({ minDuration: 3600, isStart: false });
            expect(result).toEqual({ date: '2024-09-04', time: '13:00' });
        });

        test('uses default duration when minDuration is not provided', () => {
            const result = dateUtils.getStartDate({ minDuration: 0, isStart: false });
            expect(result).toEqual({ date: '2024-09-09', time: '12:00' });
        });

        test('uses startTime when provided', () => {
            const result = dateUtils.getStartDate({
                minDuration: 3600,
                startTime: { date: '2024-09-16', time: '10:00' },
                isStart: false,
            });
            expect(result).toEqual({ date: '2024-09-16', time: '11:00' });
        });

        test('uses startTime with default duration when minDuration is 0', () => {
            const result = dateUtils.getStartDate({
                minDuration: 0,
                startTime: { date: '2024-09-16', time: '10:00' },
                isStart: false,
            });
            expect(result).toEqual({ date: '2024-09-21', time: '10:00' });
        });
    });
});
