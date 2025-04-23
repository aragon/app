import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { ISetupBodyForm, ISetupBodyFormNew } from '../../dialogs/setupBodyDialog';
import type { ISetupStageTimingForm } from '../../dialogs/setupStageTimingDialog';

export enum ProposalCreationMode {
    LISTED_BODIES = 'LISTED_BODIES',
    ANY_WALLET = 'ANY_WALLET',
}

export enum ProcessStageType {
    NORMAL = 'NORMAL',
    OPTIMISTIC = 'OPTIMISTIC',
    TIMELOCK = 'TIMELOCK',
}

export enum GovernanceType {
    BASIC = 'BASIC',
    ADVANCED = 'ADVANCED',
}

export interface ICreateProcessFormDataBase {
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
     * Defines who can create proposals for this process.
     */
    proposalCreationMode: ProposalCreationMode;
    /**
     * Defines the type of governance process basic/advanced.
     */
    governanceType: GovernanceType;
}

export interface ICreateProcessFormDataBasic extends ICreateProcessFormDataBase {
    /**
     * Basic governance type.
     */
    governanceType: GovernanceType.BASIC;
    /**
     * Body to be setup on the basic governance process.
     */
    body: ISetupBodyFormNew;
}

export interface ICreateProcessFormDataAdvanced extends ICreateProcessFormDataBase {
    /**
     * Advanced governance type.
     */
    governanceType: GovernanceType.ADVANCED;
    /**
     * Stages of the process.
     */
    stages: ICreateProcessFormStage[];
}

export type ICreateProcessFormData = ICreateProcessFormDataBasic | ICreateProcessFormDataAdvanced;

export interface ICreateProcessFormStage {
    /**
     * Internal ID of the stage used as reference for bodies.
     */
    internalId: string;
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
    timing: ISetupStageTimingForm;
    /**
     * List of bodies of the stage.
     */
    bodies: ISetupBodyForm[];
    /**
     * Number of bodies required to veto (for optimistic type) or approve.
     */
    requiredApprovals: number;
}
