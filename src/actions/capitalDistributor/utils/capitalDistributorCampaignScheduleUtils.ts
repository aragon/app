import { DateTime } from 'luxon';
import { dateUtils } from '@/shared/utils/dateUtils';
import {
    CampaignScheduleType,
    type ICapitalDistributorCreateCampaignFormData,
} from '../components/capitalDistributorCreateCampaignActionCreate';

export interface ICampaignScheduleSettings {
    startTime: bigint;
    endTime: bigint;
}

/**
 * Parses campaign schedule form fields into `uint64` timestamps (in seconds) for the smart contract.
 * Returns `{ startTime: 0n, endTime: 0n }` for open-ended campaigns (no time restrictions).
 */
class CapitalDistributorCampaignScheduleUtils {
    parseScheduleSettings = (
        formData: ICapitalDistributorCreateCampaignFormData,
    ): ICampaignScheduleSettings => {
        const {
            scheduleType,
            startTimeMode,
            startTimeFixed,
            endTimeMode,
            endTimeDuration,
            endTimeFixed,
        } = formData;

        if (scheduleType !== CampaignScheduleType.SCHEDULED) {
            return { startTime: BigInt(0), endTime: BigInt(0) };
        }

        let startTime = BigInt(0);
        let endTime = BigInt(0);

        // Parse start time: 0 means "now" (no start restriction)
        if (startTimeMode === 'fixed' && startTimeFixed != null) {
            const parsedStart = dateUtils.parseFixedDate(startTimeFixed);
            startTime = BigInt(Math.round(parsedStart.toMillis() / 1000));
        }

        // Parse end time from duration or fixed date
        if (endTimeMode === 'duration' && endTimeDuration != null) {
            const startDate =
                startTimeMode === 'fixed' && startTimeFixed != null
                    ? dateUtils.parseFixedDate(startTimeFixed)
                    : DateTime.now();
            const endDate = startDate.plus({
                days: endTimeDuration.days,
                hours: endTimeDuration.hours,
                minutes: endTimeDuration.minutes,
            });
            endTime = BigInt(Math.round(endDate.toMillis() / 1000));
        } else if (endTimeMode === 'fixed' && endTimeFixed != null) {
            const parsedEnd = dateUtils.parseFixedDate(endTimeFixed);
            endTime = BigInt(Math.round(parsedEnd.toMillis() / 1000));
        }

        return { startTime, endTime };
    };
}

export const capitalDistributorCampaignScheduleUtils =
    new CapitalDistributorCampaignScheduleUtils();
