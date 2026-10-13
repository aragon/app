import type { IInputFileAvatarValue } from '@aragon/gov-ui-kit';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IWorkspace, IWorkspaceAccount } from '../../api/workspaceService';
import type {
    ICreateWorkspaceFormAccount,
    ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';

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
     * Builds the input value of a stored avatar: a URL with no file, so the publish dialog keeps it instead of pinning.
     */
    private buildAvatarValue = (
        avatar?: string | null,
    ): IInputFileAvatarValue | undefined =>
        avatar != null ? { url: ipfsUtils.cidToSrc(avatar) } : undefined;
}

export const workspaceEditPageUtils = new WorkspaceEditPageUtils();
