import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { IDateDuration } from '@/shared/utils/dateUtils';

export interface ICreateProcessFormBody {
    /**
     * Name of the body
     */
    name: string;
}

export interface ICreateProcessFormStage {
    /**
     * Name of the stage
     */
    name: string;
    /**
     * Type of the stage
     */
    type: 'normal' | 'optimistic';
    /**
     * Voting period of the stage
     */
    votingPeriod: IDateDuration;
    /**
     * Early stage advance
     */
    earlyStageAdvance: boolean;
    /**
     * Stage expiration?
     */
    stageExpiration: boolean;
    /**
     * Voting bodies
     */
    votingBodies: ICreateProcessFormBody[];
    /**
     * Number of bodies required to approve
     */
    requiredApprovals?: number;
}

export interface ICreateProcessFormData {
    /**
     * Name of the process
     */
    name: string;
    /**
     * ID of the process
     */
    id: string;
    /**
     * Short description of the proposal.
     */
    summary: string;
    /**
     * Resources of the proposal.
     */
    resources: IResourcesInputResource[];
    /**
     * Process stages
     */
    stages: ICreateProcessFormStage[];
}
