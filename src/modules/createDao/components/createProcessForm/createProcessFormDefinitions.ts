import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import type { ISetupBodyForm } from '../../dialogs/setupBodyDialog';

export enum ProposalCreationMode {
    LISTED_BODIES = 'LISTED_BODIES',
    ANY_WALLET = 'ANY_WALLET',
}

export enum ProcessStageType {
    NORMAL = 'NORMAL',
    OPTIMISTIC = 'OPTIMISTIC',
    TIMELOCK = 'TIMELOCK',
}

const defaultVotingPeriod = { days: 7, minutes: 0, hours: 0 };

export const defaultStage: ICreateProcessFormStage = {
    name: '',
    type: ProcessStageType.NORMAL,
    timing: { votingPeriod: defaultVotingPeriod, earlyStageAdvance: false },
    requiredApprovals: 1,
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
     * List of bodies of the process.
     */
    bodies: ISetupBodyForm[];
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

export interface ICreateProcessFormProposalCreationBody {
    /**
     * ID of the body.
     */
    bodyId: string;

    // Token-specific values
    /**
     * Min voting power / balance the user needs to have for creating proposals
     */
    minVotingPower?: string;
}
