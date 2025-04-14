import { dateUtils } from '@/shared/utils/dateUtils';
import { invariant } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import type { ICreateProposalEndDateForm, ICreateProposalStartDateForm } from './createProposalUtils.api';

class CreateProposalUtils {
    isTimingDataSet = (formValues: ICreateProposalEndDateForm): boolean => {
        const { startTimeMode, startTimeFixed, endTimeMode, endTimeDuration, endTimeFixed, minimumDuration } =
            formValues;

        return (
            !!startTimeMode ||
            !!startTimeFixed ||
            !!endTimeMode ||
            !!endTimeDuration ||
            !!endTimeFixed ||
            !!minimumDuration
        );
    };

    parseStartDate = (formValues: ICreateProposalStartDateForm): number => {
        const { startTimeMode, startTimeFixed } = formValues;

        invariant(
            !startTimeMode || startTimeMode === 'now' || startTimeFixed != null,
            'PublishProposalDialogUtils.parseStartDate: startTimeFixed must be properly set when startTimeMode is set to fixed',
        );

        // Returning 0 to let the smart contracts set the start time when the transaction is executed.
        if (startTimeMode == undefined || startTimeMode === 'now') {
            return 0;
        }

        const parsedStartDate = dateUtils.parseFixedDate(startTimeFixed!);

        return this.dateToSeconds(parsedStartDate);
    };

    parseEndDate = (formValues: ICreateProposalEndDateForm): number => {
        const { startTimeMode, startTimeFixed, endTimeMode, endTimeDuration, endTimeFixed, minimumDuration } =
            formValues;
        const { hours, minutes, days } = endTimeDuration ?? {};

        invariant(
            !endTimeMode || (endTimeMode === 'duration' ? endTimeDuration != null : endTimeFixed != null),
            'PublishProposalDialogUtils.parseEndDate: endTimeDuration/endTimeFixed must be properly set.',
        );

        // Return 0 when endTime is set as duration and equals to minimumDuration to let smart contract set the correct end
        // time when the transaction is executed, otherwise the end time will be set as a few seconds before the minimum
        // duration and the transaction would fail.
        const useDefaultEndTime =
            !endTimeMode || (endTimeMode === 'duration' && dateUtils.compareDuration(minimumDuration, endTimeDuration));

        if (!endTimeMode || useDefaultEndTime) {
            return 0;
        }

        if (endTimeMode === 'duration') {
            const startDate = startTimeMode === 'now' ? DateTime.now() : dateUtils.parseFixedDate(startTimeFixed!);
            const endDate = startDate.plus({ hours, minutes, days });

            return this.dateToSeconds(endDate);
        }

        const parsedEndDate = dateUtils.parseFixedDate(endTimeFixed!);

        return this.dateToSeconds(parsedEndDate);
    };

    /**
     * Used in the specific cases when the end date is not set, i.e. create process proposal
     * @param minDuration in seconds
     * @returns {number} end date in seconds
     */
    createDefaultEndDate = (minDuration: number): number => {
        const sevenDaysInSeconds = 7 * 24 * 60 * 60;

        if (minDuration > sevenDaysInSeconds) {
            // setting 0 will properly set endDate to minDuration ... see above comment for more details.
            return 0;
        }

        const startDate = DateTime.now();
        const endDate = startDate.plus({
            seconds: sevenDaysInSeconds,
        });

        return this.dateToSeconds(endDate);
    };

    private dateToSeconds = (date: DateTime): number => Math.round(date.toMillis() / 1000);
}

export const createProposalUtils = new CreateProposalUtils();
