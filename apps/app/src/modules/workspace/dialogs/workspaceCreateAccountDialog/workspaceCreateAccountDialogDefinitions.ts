import type {
    ICompositeAddress,
    IInputFileAvatarValue,
} from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum WorkspaceCreateAccountType {
    SAFE = 'SAFE',
    ARAGON = 'ARAGON',
}

export enum WorkspaceCreateAccountStep {
    NETWORK = 'NETWORK',
    DETAILS = 'DETAILS',
    SIGNERS = 'SIGNERS',
    TYPE = 'TYPE',
}

export interface IWorkspaceCreateAccountForm {
    /**
     * Network the account is deployed on.
     */
    network: Network;
    /**
     * Name of the account.
     */
    name: string;
    /**
     * Description of the account.
     */
    description: string;
    /**
     * Logo of the account.
     */
    avatar?: IInputFileAvatarValue;
    /**
     * Links of the account.
     */
    resources: IResourcesInputResource[];
    /**
     * Signers of the account, named `members` as the address list expects.
     */
    members: ICompositeAddress[];
    /**
     * Number of signers that must approve a transaction.
     */
    threshold: number;
    /**
     * How the account is deployed.
     */
    accountType: WorkspaceCreateAccountType;
}

export const workspaceCreateAccountDialogSteps: IWizardStepperStep[] = [
    WorkspaceCreateAccountStep.NETWORK,
    WorkspaceCreateAccountStep.DETAILS,
    WorkspaceCreateAccountStep.SIGNERS,
    WorkspaceCreateAccountStep.TYPE,
].map((id, order) => ({
    id,
    order,
    meta: {
        name: `app.workspace.workspaceCreateAccountDialog.steps.${id}.title`,
    },
}));
