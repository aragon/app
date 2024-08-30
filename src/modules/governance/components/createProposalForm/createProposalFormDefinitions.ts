import type { IProposalAction } from '@aragon/ods';

export interface ICreateProposalFormResources {
    /**
     * Name of the resource.
     */
    name: string;
    /**
     * URL of the resource.
     */
    url: string;
}

export interface ICreateProposalFormFixedDateTime {
    /**
     * Date in YYYY-MM-DD format.
     */
    date: string;
    /**
     * Time in HH:MM format.
     */
    time: string;
}

export interface ICreateProposalFormDuration {
    /**
     * Minutes as a number between [0, 59] range.
     */
    minutes: number;
    /**
     * Hours as a number between [0, 23] range.
     */
    hours: number;
    /**
     * Number of days.
     */
    days: number;
}

export interface ICreateProposalFormData {
    /**
     * Title of the proposal.
     */
    title: string;
    /**
     * Short description of the proposal.
     */
    summary: string;
    /**
     * Long description of the proposal supporting HTML tags.
     */
    body?: string;
    /**
     * Defines if the user wants to add actions to the proposal or not.
     */
    addActions: boolean;
    /**
     * Resources of the proposal.
     */
    resources: ICreateProposalFormResources[];
    /**
     * List of actions to be executed if the proposal succeeds.
     */
    actions: IProposalAction[];
    /**
     * Defines if the start time of the proposal is now or at a specific date.
     */
    startTimeMode: 'now' | 'fixed';
    /**
     * Fixed start time only set when startTimeMode is set to fixed.
     */
    startTimeFixed?: ICreateProposalFormFixedDateTime;
    /**
     * Defines if the end time of the proposal is with duration or fixed format.
     */
    endTimeMode: 'duration' | 'fixed';
    /**
     * End time of the proposal in duration (minutes, hours, days) format only set when endTimeMode is set to duration.
     */
    endTimeDuration?: ICreateProposalFormDuration;
    /**
     * Fixed end time only set when endTimeMode is set to fixed.
     */
    endTimeFixed?: ICreateProposalFormFixedDateTime;
    /**
     * Minimum duration of the proposal in seconds.
     */
    minimumDuration?: ICreateProposalFormDuration;
}
