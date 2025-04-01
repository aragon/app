import { DateTime, Duration } from 'luxon';
import type { IDateDuration, IDateFixed } from './dateUtils.api';

export interface IValidateDurationParams {
    /**
     * Value to be validated.
     */
    value: IDateDuration | number;
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
    secondsToDuration = (seconds: number) => {
        const duration = Duration.fromObject({ seconds }).shiftTo('days', 'hours', 'minutes');
        const { days, hours, minutes } = duration;

        return { days, hours, minutes };
    };

    durationToSeconds = (duration: IDateDuration) => Duration.fromObject(duration).as('seconds');

    parseFixedDate = ({ date, time }: IDateFixed): DateTime => {
        const { hour, minute } = DateTime.fromISO(time);

        return DateTime.fromISO(date).set({ hour, minute });
    };

    dateToFixedDate = (date: DateTime): IDateFixed | null => {
        const isoDate = date.toISODate();
        const isoTime = date.toFormat('HH:mm');

        return isoDate == null ? null : { date: isoDate, time: isoTime };
    };

    validateDuration = ({ value, minDuration }: IValidateDurationParams) => {
        if (!minDuration) {
            return true;
        }

        const valueObject = typeof value === 'number' ? { seconds: value } : value;
        const isValid = Duration.fromObject(valueObject) >= Duration.fromObject(minDuration);

        return isValid;
    };

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

    compareDuration = (first?: IDateDuration, second?: IDateDuration) =>
        Duration.fromObject(first ?? {}).equals(Duration.fromObject(second ?? {}));
}

export const dateUtils = new DateUtils();
