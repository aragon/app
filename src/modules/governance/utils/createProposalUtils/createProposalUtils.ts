import { dateUtils, type IDateDuration } from '@/shared/utils/dateUtils';
import { invariant } from '@aragon/gov-ui-kit';
import { DateTime, Duration } from 'luxon';
import type { ICreateProposalEndDateForm, ICreateProposalStartDateForm } from './createProposalUtils.api';

class CreateProposalUtils {
    parseStartDate = (formValues: ICreateProposalStartDateForm): number => {
        const { startTimeMode, startTimeFixed } = formValues;

        invariant(
            startTimeMode === 'now' || startTimeFixed != null,
            'PublishProposalDialogUtils.parseStartDate: startTimeFixed must be properly set when startTimeMode is set to fixed',
        );

        // Returning 0 to let the smart contracts set the start time when the transaction is executed.
        if (startTimeMode === 'now') {
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
            endTimeMode === 'duration' ? endTimeDuration != null : endTimeFixed != null,
            'PublishProposalDialogUtils.parseEndDate: endTimeDuration/endTimeFixed must be properly set.',
        );

        // Return 0 when endTime is set as duration and equals to minimumDuration to let smart contract set the correct end
        // time when the transaction is executed, otherwise the end time will be set as a few seconds before the minimum
        // duration and the transaction would fail.
        if (endTimeMode === 'duration' && this.compareTimeDuration(minimumDuration, endTimeDuration)) {
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

    private dateToSeconds = (date: DateTime): number => Math.round(date.toMillis() / 1000);

    private compareTimeDuration = (first?: IDateDuration, second?: IDateDuration) =>
        Duration.fromObject(first ?? {}).equals(Duration.fromObject(second ?? {}));
}

export const createProposalUtils = new CreateProposalUtils();
