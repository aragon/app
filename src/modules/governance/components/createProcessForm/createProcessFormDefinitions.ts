// es @typescript-eslint/no-explicit-any
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import { type IUseFormFieldReturn } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';

export interface IMultisigVotingMember {
    /**
     * Address of the member.
     */
    address: string;
    /**
     * Weight of the member's vote.
     */
    voteWeight: number;
}

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

export interface ICreateProcessFormBodyData {
    bodyNameField: string;
    bodyGovernanceTypeField: string;
    tokenNameField: string;
    tokenSymbolField: string;
    supportThresholdField: number;
    minimumParticipationField: number;
    voteChangeField: boolean;
    membersField?: ITokenVotingMember[] | IMultisigVotingMember[];
    multisigThresholdField: number;
}

export interface ICreateProcessFormBodyDataFields {
    bodyNameField: IUseFormFieldReturn<ICreateProcessFormBodyData, 'bodyNameField'>;
    bodyGovernanceTypeField: IUseFormFieldReturn<ICreateProcessFormBodyData, 'bodyGovernanceTypeField'>;
    tokenNameField: IUseFormFieldReturn<ICreateProcessFormBodyData, 'tokenNameField'>;
    tokenSymbolField: IUseFormFieldReturn<ICreateProcessFormBodyData, 'tokenSymbolField'>;
    supportThresholdField: IUseFormFieldReturn<ICreateProcessFormBodyData, 'supportThresholdField'>;
    minimumParticipationField: IUseFormFieldReturn<ICreateProcessFormBodyData, 'minimumParticipationField'>;
    voteChangeField: IUseFormFieldReturn<ICreateProcessFormBodyData, 'voteChangeField'>;
    membersField: IUseFormFieldReturn<ICreateProcessFormBodyData, 'membersField'>;
    multisigThresholdField: IUseFormFieldReturn<ICreateProcessFormBodyData, 'multisigThresholdField'>;
}

export interface ICreateProcessFormStage {
    actionType: any;
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
    bodies: ICreateProcessFormBodyDataFields[];
    /**
     * Number of bodies required to approve
     */
    requiredApprovals?: number;
}

export interface ICreateProcessFormData {
    startTimeMode: 'fixed' | 'now';
    endTimeMode: 'fixed' | 'duration';
    addActions: boolean;
    title: string;
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
    /**
     * actions
     */
    actions: any[];
}
