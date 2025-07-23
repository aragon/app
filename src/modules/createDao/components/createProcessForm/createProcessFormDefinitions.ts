import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { ISetupBodyForm, ISetupBodyFormExisting, ISetupBodyFormNew } from '../../dialogs/setupBodyDialog';
import type { ISetupStageSettingsForm } from '../../dialogs/setupStageSettingsDialog';

export enum ProposalCreationMode {
    LISTED_BODIES = 'LISTED_BODIES',
    ANY_WALLET = 'ANY_WALLET',
}

export enum ProcessStageType {
    NORMAL = 'NORMAL',
    OPTIMISTIC = 'OPTIMISTIC',
}

export enum GovernanceType {
    BASIC = 'BASIC',
    ADVANCED = 'ADVANCED',
}

export enum ProcessPermission {
    ANY = 'ANY',
    SELECTED = 'SELECTED',
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
    /**
     * The permissions of the process. Either any action or specific actions.
     */
    permissions: ProcessPermission.ANY | ProcessPermission.SELECTED;
    /**
     * List of actions that the DAO will be able to execute. Later these will be parsed to the correct format the smart contract expects.
     */
    permissionSelectors: IProposalActionData[];
}

export interface ICreateProcessFormDataBasic extends ICreateProcessFormDataBase {
    /**
     * Basic governance type.
     */
    governanceType: GovernanceType.BASIC;
    /**
     * Body to be setup on the basic governance process.
     */
    body: ISetupBodyFormNew | ISetupBodyFormExisting;
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
     * List of bodies of the stage.
     */
    bodies: ISetupBodyForm[];
    /**
     * Settings of the stage.
     */
    settings: ISetupStageSettingsForm;
}
