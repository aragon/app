import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { IDateDuration } from '@/shared/utils/dateUtils';

export interface ITokenVotingMember {
    /**
     * Address of the member.
     */
    address: string;
    /**
     * Token amount to be distributed.
     */
    tokenAmount: string | number;
}

export interface ICreateProcessFormBody {
    /**
     * Name of the body
     */
    bodyName: string;
    /**
     * Governance type of the body
     */
    governanceType: 'tokenVoting';
    /**
     * Token name
     */
    tokenName: string;
    /**
     * Token symbol
     */
    tokenSymbol: string;
    /**
     * Members of the body
     */
    members?: ITokenVotingMember[];

    supportThresholdPercentage: number;
    minimumParticipationPercentage: number;
    voteChange: boolean;
}

export interface ICreateProcessFormStage {
    /**
     * Name of the stage
     */
    stageName: string;
    /**
     * Type of the stage
     */
    stageType: 'normal' | 'optimistic';
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
    processName: string;
    /**
     * ID of the process
     */
    processId: string;
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
