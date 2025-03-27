import type { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export enum ProposalCreationMode {
    LISTED_BODIES = 'LISTED_BODIES',
    ANY_WALLET = 'ANY_WALLET',
}

export enum ProcessStageType {
    NORMAL = 'NORMAL',
    OPTIMISTIC = 'OPTIMISTIC',
    TIMELOCK = 'TIMELOCK',
}

export const defaultStage: ICreateProcessFormStage = {
    name: '',
    type: ProcessStageType.NORMAL,
    timing: {
        votingPeriod: { days: 7, minutes: 0, hours: 0 },
        earlyStageAdvance: false,
    },
    requiredApprovals: 1,
    bodies: [],
};

export interface ICreateProcessFormData {
    /**
     * Name of the process.
     */
    name: string;
    /**
     * Key of the process used as prefix for proposals.
     */
    processKey: string;
    /**
     * Description of the process.
     */
    description: string;
    /**
     * Resources of the process.
     */
    resources: IResourcesInputResource[];
    /**
     * List of stages of the process.
     */
    stages: ICreateProcessFormStage[];
    /**
     * Permissions for creating proposals.
     */
    permissions: ICreateProcessFormPermissions;
}

export interface ICreateProcessFormStageTiming {
    /**
     * The period of time the stage is open for voting.
     */
    votingPeriod: IDateDuration;
    /**
     * Defines if the stage can advance early or not.
     */
    earlyStageAdvance: boolean;
    /**
     * The amount of time that the stage will be eligible to be advanced.
     */
    stageExpiration?: IDateDuration;
}

export interface ICreateProcessFormStage {
    /**
     * Name of the stage.
     */
    name: string;
    /**
     * Type of the stage.
     */
    type: ProcessStageType;
    /**
     * Values related to the timing of the stage.
     */
    timing: ICreateProcessFormStageTiming;
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
    /**
     * Name of the body.
     */
    name: string;
    /**
     * ID of the body generated internally to reference bodies to permissions.
     */
    id: string;
    /**
     * Optional description of the voting body.
     */
    description?: string;
    /**
     * Resources of the body.
     */
    resources: IResourcesInputResource[];
    /**
     * Governance type of the body.
     */
    governanceType: string;
    /**
     * Members of the voting body.
     */
    members: ICompositeAddress[] | ITokenVotingMember[];

    // Token-specific values
    /**
     * Type of the token used on the body.
     */
    tokenType: 'imported' | 'new';
    /**
     * Address of the token to be imported.
     */
    importTokenAddress?: string;
    /**
     * Name of the governance token.
     */
    tokenName?: string;
    /**
     * Symbol of the governance token.
     */
    tokenSymbol?: string;
    /**
     * The percentage of tokens that vote yes, out of all tokens that have voted, must be greater than this value for
     * the proposal to pass.
     */
    supportThreshold: number;
    /**
     * The percentage of tokens that participate in a proposal, out of the total supply, must be greater than or equal
     * to this value.
     */
    minParticipation: number;
    /**
     * Allows voters to change their vote during the voting period.
     */
    votingMode: DaoTokenVotingMode;

    // Multisig-specific values
    /**
     * Amount of addresses in the authorized list that must approve a proposal for it to pass.
     */
    minApprovals: number;
}

export interface ICreateProcessFormPermissions {
    /**
     * Defines who can create proposals on the process.
     */
    proposalCreationMode: ProposalCreationMode;
    /**
     * List of bodies that can create proposals when proposalCreationMode is set to "LISTED_BODIES".
     */
    proposalCreationBodies: ICreateProcessFormProposalCreationBody[];
}

export interface ICreateProcessFormProposalCreationBody<TSettings = Record<string, unknown>> {
    /**
     * ID of the body.
     */
    bodyId: string;
    /**
     * Flag to determine if the checkbox is checked
     */
    checked?: boolean;
    /**
     * Settings containing plugin-specific values.
     */
    settings?: TSettings;
}

export interface ITokenVotingMember extends ICompositeAddress {
    /**
     * Token amount to be distributed.
     */
    tokenAmount: string | number;
}
