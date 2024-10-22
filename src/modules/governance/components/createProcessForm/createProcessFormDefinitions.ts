import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
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
    governanceType: 'multisig' | 'tokenVoting';
    /**
     * Members of the voting body.
     */
    members: ICompositeAddress[] | ITokenVotingMember[];

    // Token-specific values
    /**
     * Name of the governance token.
     */
    tokenName: string;
    /**
     * Symbol of the governance token.
     */
    tokenSymbol: string;
    /**
     * The percentage of tokens that vote yes, out of all tokens that have voted, must be greater than this value for
     * the proposal to pass.
     */
    supportThreshold: number;
    /**
     * The percentage of tokens that participate in a proposal, out of the total supply, must be greater than or equal
     * to this value for the proposal to pass.
     */
    minimumParticipation: number;
    /**
     * Allows voters to change their vote during the voting period.
     */
    voteChange: boolean;

    // Multisig-specific values
    /**
     * Amount of addresses in the authorized list that must approve a proposal for it to pass.
     */
    multisigThreshold: number;
}

export interface ICreateProcessFormPermissions {
    /**
     * Defines who can create proposals on this process.
     */
    proposalCreation: 'any' | 'bodies';
    /**
     * List of bodies that can create proposals.
     */
    proposalCreationBodies: ICreateProcessFormProposalCreationBody[];
}

export interface ICreateProcessFormProposalCreationBody {
    /**
     * ID of the body.
     */
    id: string;
    /**
     * Settings of the specific body for creating proposals.
     */
    settings?: Record<string, unknown>;
}

export interface ITokenVotingMember extends ICompositeAddress {
    /**
     * Token amount to be distributed.
     */
    tokenAmount: string | number;
}
