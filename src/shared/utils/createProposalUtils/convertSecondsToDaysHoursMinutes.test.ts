import { convertSecondsToDaysHoursMinutes } from './convertSecondsToDaysHoursMinutes';

describe('convertSecondsToDaysHoursMinutes', () => {
    test('converts 0 seconds correctly', () => {
        expect(convertSecondsToDaysHoursMinutes(0)).toEqual({ days: 0, hours: 0, minutes: 0 });
    });

    test('converts 60 seconds to 1 minute', () => {
        expect(convertSecondsToDaysHoursMinutes(60)).toEqual({ days: 0, hours: 0, minutes: 1 });
    });

    test('converts 3600 seconds to 1 hour', () => {
        expect(convertSecondsToDaysHoursMinutes(3600)).toEqual({ days: 0, hours: 1, minutes: 0 });
    });

    test('converts 86400 seconds to 1 day', () => {
        expect(convertSecondsToDaysHoursMinutes(86400)).toEqual({ days: 1, hours: 0, minutes: 0 });
    });

    test('converts a complex time correctly', () => {
        // 2 days, 3 hours, 45 minutes
        const seconds = 2 * 86400 + 3 * 3600 + 45 * 60;
        expect(convertSecondsToDaysHoursMinutes(seconds)).toEqual({ days: 2, hours: 3, minutes: 45 });
    });

    test('handles large numbers of seconds', () => {
        const seconds = 100 * 86400 + 23 * 3600 + 59 * 60;
        expect(convertSecondsToDaysHoursMinutes(seconds)).toEqual({ days: 100, hours: 23, minutes: 59 });
    });
});
