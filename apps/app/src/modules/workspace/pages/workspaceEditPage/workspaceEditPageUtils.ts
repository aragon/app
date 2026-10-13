import type { IInputFileAvatarValue } from '@aragon/gov-ui-kit';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IWorkspace, IWorkspaceAccount } from '../../api/workspaceService';
import type {
    ICreateWorkspaceFormAccount,
    ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';
import { WorkspaceEditWizardStep } from './workspaceEditPageDefinitions';

class WorkspaceEditPageUtils {
    /**
     * Builds the values of the workspace form from a stored workspace, the inverse of
     * `publishWorkspaceDialogUtils.buildWorkspace`.
     * @param workspace - Workspace as stored on the registry.
     * @returns The form values the workspace is edited from.
     */
    buildFormValues = (workspace: IWorkspace): ICreateWorkspaceFormData => {
        const { name, description, avatar, links, targets, accounts } =
            workspace;

        return {
            name,
            description,
            avatar: this.buildAvatarValue(avatar),
            resources: links.map((link) => ({
                name: link.name,
                url: link.url,
            })),
            targets: targets.map(({ network, address }) => ({
                network,
                address,
            })),
            accounts: accounts.map(this.buildAccountValues),
        };
    };

    /**
     * Resolves the step the wizard opens on from the step query parameter, matched case-insensitively.
     * @param stepParam - Value of the step query parameter, if any.
     * @returns The ID of the step, or undefined to open the first step when the parameter names none.
     */
    resolveInitialStep = (
        stepParam?: string | string[],
    ): WorkspaceEditWizardStep | undefined => {
        if (typeof stepParam !== 'string') {
            return undefined;
        }

        return Object.values(WorkspaceEditWizardStep).find(
            (step) => step.toLowerCase() === stepParam.toLowerCase(),
        );
    };

    private buildAccountValues = (
        account: IWorkspaceAccount,
    ): ICreateWorkspaceFormAccount => {
        const { network, address, metadata } = account;

        return {
            network,
            address,
            metadata:
                metadata != null
                    ? {
                          name: metadata.name,
                          description: metadata.description ?? '',
                          avatar: this.buildAvatarValue(metadata.avatar),
                      }
                    : undefined,
        };
    };

    /**
     * Builds the avatar input value of a stored avatar. It carries the URL alone, no file, which is what tells the
     * publish dialog to keep the stored avatar rather than pin a new one.
     */
    private buildAvatarValue = (
        avatar?: string | null,
    ): IInputFileAvatarValue | undefined =>
        avatar != null ? { url: ipfsUtils.cidToSrc(avatar) } : undefined;
}

export const workspaceEditPageUtils = new WorkspaceEditPageUtils();
