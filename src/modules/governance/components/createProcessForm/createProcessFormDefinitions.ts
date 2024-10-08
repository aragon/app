/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { useFormField } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';

export interface IMultisigVotingMember {
    /**
     * Address details of the member.
     */
    address: IAddressInputResolvedValue;
}

export interface IOpenDialogState {
    /**
     * Dialog open state.
     */
    dialogOpen: boolean;
    /**
     * Index of the body to edit.
     */
    editBodyIndex?: number;
}

export interface ITokenVotingMember {
    /**
     * Address details of the member.
     */
    address: IAddressInputResolvedValue;
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
    resourcesField: IResourcesInputResource[];
    membersField?: ITokenVotingMember[] | IMultisigVotingMember[];
    multisigThresholdField: number;
    bodyResourceField: IResourcesInputResource[];
}

export type BodyInputItemBaseForm = Record<string, any>;

export interface IBodyFields {
    bodyNameField: ReturnType<typeof useFormField>;
    bodySummaryField: ReturnType<typeof useFormField>;
    bodyGovernanceTypeField: ReturnType<typeof useFormField>;
    tokenNameField: ReturnType<typeof useFormField>;
    tokenSymbolField: ReturnType<typeof useFormField>;
    supportThresholdField: ReturnType<typeof useFormField>;
    minimumParticipationField: ReturnType<typeof useFormField>;
    voteChangeField: ReturnType<typeof useFormField>;
    multisigThresholdField: ReturnType<typeof useFormField>;
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
    bodies: ICreateProcessFormBodyData[];
    /**
     * Number of bodies required to approve
     */
    requiredApprovals?: number;
}

export type ProcessInputItemBaseForm = Record<string, any>;
export interface ICreateProcessFormData {
    startTimeMode?: 'fixed' | 'now';
    endTimeMode?: 'fixed' | 'duration';
    addActions?: boolean;
    actions: any[];
    title?: string;
    process: {
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
    };
    /**
     * Process stages
     */
    stages: ICreateProcessFormStage[];
}

export interface IAddressInputResolvedValue {
    /**
     * Address value.
     */
    address?: string;
    /**
     * ENS name linked to the given address.
     */
    name?: string;
}

export interface ICreateProcessFormBodyNameProps {
    /**
     * The name of the stage.
     */
    stageName: string;
    /**
     * The index of the stage.
     */
    stageIndex: number;
    /**
     * The index of the body.
     */
    bodyIndex: number;
}

export type StageInputItemBaseForm = Record<string, any>;

export interface IStageFields {
    stageNameField: ReturnType<typeof useFormField>;
    stageTypeField: ReturnType<typeof useFormField>;
    votingPeriodField: ReturnType<typeof useFormField>;
    earlyStageField: ReturnType<typeof useFormField>;
    stageExpirationField: ReturnType<typeof useFormField>;
    stageExpirationPeriodField: ReturnType<typeof useFormField>;
}
