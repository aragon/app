import { DateTime, Duration } from 'luxon';
import type { IDateDuration, IDateFixed } from './dateUtils.api';

export interface IValidateDurationParams {
    /**
     * Value to be validated.
     */
    value: IDateDuration;
    /**
     * Minimum duration to check.
     */
    minDuration?: IDateDuration;
}

export interface IValidateFixedTimeParams {
    /**
     * Value to be validated.
     */
    value: IDateFixed;
    /**
     * Value must be greater than the minimum time set.
     */
    minTime: DateTime;
    /**
     * When set, the value must be greater than the minTime + minDuration.
     */
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

        return isoDate == null ? null : { date: isoDate, time: isoTime };
    };

    validateDuration = ({ value, minDuration }: IValidateDurationParams) =>
        minDuration ? Duration.fromObject(value) >= Duration.fromObject(minDuration) : true;

    validateFixedTime = ({ value, minTime, minDuration }: IValidateFixedTimeParams) => {
        const { date, time } = value;

        const isDateValid = date.length > 0 && time.length > 0;

        if (!isDateValid) {
            return false;
        }

        const parsedValue = this.parseFixedDate(value);
        const isMinTimeValid = parsedValue >= minTime;
        const isMinDurationValid = minDuration == null || parsedValue >= minTime.plus(minDuration);

        return isMinTimeValid && isMinDurationValid;
    };
}

export const dateUtils = new DateUtils();
