import { DateTime } from 'luxon';

interface GetStartDateParams {
    minDuration: number;
    startTime?: { date: string; time: string };
    isNow: boolean;
}

class DateUtils {
    secondsToDaysHoursMinutes = (totalSeconds: number) => {
        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        return { days, hours, minutes };
    };

    getStartDate = ({ minDuration, startTime, isNow }: GetStartDateParams): { date: string; time: string } => {
        let defaultDateTime: DateTime;

        if (isNow) {
            defaultDateTime = DateTime.now();
        } else if (startTime) {
            defaultDateTime = DateTime.fromISO(`${startTime.date}T${startTime.time}`);
            if (minDuration > 0) {
                defaultDateTime = defaultDateTime.plus({ seconds: minDuration });
            } else {
                defaultDateTime = defaultDateTime.plus({ days: 5 });
            }
        } else if (minDuration > 0) {
            defaultDateTime = DateTime.now().plus({ seconds: minDuration });
        } else {
            defaultDateTime = DateTime.now().plus({ days: 5 });
        }

        return {
            date: defaultDateTime.toISODate() ?? '',
            time: defaultDateTime.toFormat('HH:mm'),
        };
    };
}

export const dateUtils = new DateUtils();
