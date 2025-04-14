import type { IDateDuration, IDateFixed } from '@/shared/utils/dateUtils';

export interface ICreateProposalStartDateForm {
    /**
     * Defines if the start time of the proposal is now or at a specific date.
     */
    startTimeMode?: 'now' | 'fixed';
    /**
     * Fixed start time only set when startTimeMode is set to fixed.
     */
    startTimeFixed?: IDateFixed;
}

export interface ICreateProposalEndDateForm extends ICreateProposalStartDateForm {
    /**
     * Defines if the end time of the proposal is with duration or fixed format.
     */
    endTimeMode?: 'duration' | 'fixed';
    /**
     * End time of the proposal in duration (minutes, hours, days) format only set when endTimeMode is set to duration.
     */
    endTimeDuration?: IDateDuration;
    /**
     * Fixed end time only set when endTimeMode is set to fixed.
     */
    endTimeFixed?: IDateFixed;
    /**
     * Minimum duration of the proposal in seconds.
     */
    minimumDuration?: IDateDuration;
}
