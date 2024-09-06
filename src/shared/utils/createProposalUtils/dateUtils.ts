import { DateTime, Duration } from 'luxon';
import type { IDateDuration, IDateFixed } from './dateUtils.api';

export interface IValidateDurationParams {
    value: IDateDuration;
    minDuration?: IDateDuration;
}

export interface IValidateFixedTimeParams {
    value: IDateFixed;
    minTime: DateTime;
    minDuration?: IDateDuration;
}

class DateUtils {
    secondsToDaysHoursMinutes = (totalSeconds: number) => {
        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        return { days, hours, minutes };
    };

    parseFixedDate = ({ date, time }: IDateFixed): DateTime => {
        const { hour, minute } = DateTime.fromISO(time);
        return DateTime.fromISO(date).set({ hour, minute });
    };

    dateToFixedDate = (date: DateTime): IDateFixed | null => {
        const isoDate = date.toISODate();
        const isoTime = date.toFormat('HH:mm');
        if (!isoDate || !isoTime) {
            return null;
        }
        return {
            date: isoDate,
            time: isoTime,
        };
    };

    validateDuration = ({ value, minDuration }: IValidateDurationParams) => {
        if (minDuration) {
            return Duration.fromObject(value) >= Duration.fromObject(minDuration);
        }
        return true;
    };

    validateFixedTime = ({ value, minTime, minDuration }: IValidateFixedTimeParams) => {
        if (!value.date.length || !value.time.length) {
            return false;
        }

        const parsedValue = this.parseFixedDate(value);

        if (minTime && parsedValue < minTime) {
            return false;
        }
        if (minTime && minDuration && parsedValue < minTime.plus(minDuration)) {
            return false;
        }
        return true;
    };
}

export const dateUtils = new DateUtils();
