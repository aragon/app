import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { useFormField } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import type { ICompositeAddress } from '@aragon/ods';

export interface ICreateProcessFormData {
    /**
     * Name of the process.
     */
    name: string;
    /**
     * Key of the process used as prefix for proposals.
     */
    key: string;
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

export interface ICreateProcessFormStage {
    /**
     * Name of the stage.
     */
    name: string;
    /**
     * Type of the stage.
     */
    type: 'normal' | 'optimistic';
    /**
     * The period of time a process is open for voting.
     */
    votingPeriod: IDateDuration;
    /**
     * Defines if the stage can advance early.
     */
    earlyStageAdvance: boolean;
    /**
     * The amount of time that the proposal will be eligible to be advanced to the next stage.
     */
    stageExpiration?: IDateDuration;
    /**
     * Number of bodies required to veto (for optimistic type) or approve.
     */
    requiredApprovals: number;
    /**
     * Voting bodies of the stage.
     */
    bodies: ICreateProcessFormBody[];
}

export interface ICreateProcessFormBody {
    bodyNameField: string;
    bodyGovernanceTypeField: string;
    tokenNameField: string;
    tokenSymbolField: string;
    supportThresholdField: number;
    minimumParticipationField: number;
    voteChangeField: boolean;
    resourcesField: IResourcesInputResource[];
    members: ITokenVotingMember[] | IMultisigVotingMember[];
    multisigThresholdField: number;
    bodyResourceField: IResourcesInputResource[];
}

export interface IMultisigVotingMember {
    /**
     * Address details of the member.
     */
    address: ICompositeAddress;
}

export interface IOpenDialogState {
    /**
     * Dialog open state.
     */
    dialogOpen: boolean;
    /**
     * Index of the body to edit.
     */
    editBodyIndex: number;
    newBody?: boolean;
}

export interface ITokenVotingMember {
    /**
     * Address details of the member.
     */
    address: ICompositeAddress;
    /**
     * Token amount to be distributed.
     */
    tokenAmount: string | number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export interface ICreateProcessFormBodyNameProps {
    /**
     * The name of the stage.
     */
    stageFieldName: string;
    /**
     * The index of the body.
     */
    bodyIndex: number;
}
