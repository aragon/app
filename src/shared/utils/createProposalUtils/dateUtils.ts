import { type IAdvancedDateInputDateFixed } from '@/shared/components/advancedDateInput';
import { DateTime } from 'luxon';

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
}

export const dateUtils = new DateUtils();
