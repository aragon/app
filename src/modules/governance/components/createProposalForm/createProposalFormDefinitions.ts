import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { IDateDuration, IDateFixed } from '@/shared/utils/dateUtils';
import type { IProposalAction } from '../../api/governanceService';

export interface IProposalActionIndexed extends IProposalAction {
    /**
     * Index of the action inside the form.
     */
    index: number;
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
    resources: IResourcesInputResource[];
    /**
     * List of actions to be executed if the proposal succeeds.
     */
    actions: IProposalActionIndexed[];
    /**
     * Defines if the start time of the proposal is now or at a specific date.
     */
    startTimeMode: 'now' | 'fixed';
    /**
     * Fixed start time only set when startTimeMode is set to fixed.
     */
    startTimeFixed?: IDateFixed;
    /**
     * Defines if the end time of the proposal is with duration or fixed format.
     */
    endTimeMode: 'duration' | 'fixed';
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
