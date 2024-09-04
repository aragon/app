import { type IAdvancedDateInputDateFixed } from '@/shared/components/advancedDateInput';
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

    parseFixedDate = ({ date, time }: IAdvancedDateInputDateFixed): DateTime => {
        const { hour, minute } = DateTime.fromISO(time);
        return DateTime.fromISO(date).set({ hour, minute });
    };

    getStartDate = ({ minDuration, startTime, isNow }: GetStartDateParams): { date: string; time: string } => {
        const defaultMinDuration = 5 * 24 * 60 * 60; // 5 days in seconds
        const baseTime = startTime ? dateUtils.parseFixedDate(startTime) : DateTime.now();

        const duration = minDuration || defaultMinDuration;

        const resultDateTime = isNow ? DateTime.now() : baseTime.plus({ seconds: duration });

        return {
            date: resultDateTime.toISODate() ?? '',
            time: resultDateTime.toFormat('HH:mm'),
        };
    };
}

export const dateUtils = new DateUtils();
