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

        let startTimeSeconds = 0;
        let endTimeSeconds = 0;

        // Parse start time: 0 means "now" (no start restriction)
        if (startTimeMode === 'fixed' && startTimeFixed != null) {
            const parsedStart = dateUtils.parseFixedDate(startTimeFixed);
            startTimeSeconds = parsedStart.toSeconds();
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
            endTimeSeconds = endDate.toSeconds();
        } else if (endTimeMode === 'fixed' && endTimeFixed != null) {
            const parsedEnd = dateUtils.parseFixedDate(endTimeFixed);
            endTimeSeconds = parsedEnd.toSeconds();
        }

        return {
            startTime: BigInt(Math.round(startTimeSeconds)),
            endTime: BigInt(Math.round(endTimeSeconds)),
        };
    };
}

export const capitalDistributorCampaignScheduleUtils =
    new CapitalDistributorCampaignScheduleUtils();
