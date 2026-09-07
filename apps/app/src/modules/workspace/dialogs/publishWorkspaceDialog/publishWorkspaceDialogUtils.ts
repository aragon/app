import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    type ICreateWorkspaceBody,
    type IWorkspaceAccount,
    type IWorkspaceAccountMetadata,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type {
    ICreateWorkspaceFormAccount,
    ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IBuildWorkspaceParams {
    /**
     * Values of the create-workspace form.
     */
    values: ICreateWorkspaceFormData;
    /**
     * Address of the connected user, set as the owner of the workspace.
     */
    owner: string;
    /**
     * CID of the pinned workspace avatar, undefined when the workspace has no avatar.
     */
    avatarCid?: string;
    /**
     * CIDs of the pinned account avatars, ordered as the accounts of the form values.
     */
    accountAvatarCids: (string | undefined)[];
}

class PublishWorkspaceDialogUtils {
    /**
     * Builds the workspace to be persisted from the form values, pinning results and connected address.
     * @param params - Form values, owner and pinned avatar CIDs.
     * @returns The workspace to be sent to the registry, without an ID as it is assigned by the registry.
     */
    buildWorkspace = (params: IBuildWorkspaceParams): ICreateWorkspaceBody => {
        const { values, owner, avatarCid, accountAvatarCids } = params;
        const { name, description, resources, targets, accounts } = values;

        return {
            name,
            description,
            avatar: ipfsUtils.cidToUri(avatarCid) ?? null,
            links: resources,
            owner,
            accounts: accounts.map((account, index) =>
                this.buildAccount(account, accountAvatarCids[index]),
            ),
            targets: targets.map(({ address, network }) => ({
                address,
                network,
            })),
        };
    };

    /**
     * Returns the avatar files to be pinned for the given accounts, ordered as the accounts themselves.
     * @param accounts - Accounts of the create-workspace form.
     * @returns One entry per account, undefined when the account has no avatar to pin.
     */
    getAccountAvatarFiles = (
        accounts: ICreateWorkspaceFormAccount[],
    ): (File | undefined)[] =>
        accounts.map((account) =>
            this.hasMetadata(account)
                ? account.metadata?.avatar?.file
                : undefined,
        );

    /**
     * Checks if the given account has metadata worth storing, i.e. the user named it. The metadata section registers
     * empty fields as soon as it is opened, therefore an empty name means the user added no metadata.
     * @param account - Account of the create-workspace form.
     * @returns True when the account metadata must be stored.
     */
    hasMetadata = (account: ICreateWorkspaceFormAccount): boolean =>
        (account.metadata?.name ?? '').trim() !== '';

    private buildAccount = (
        account: ICreateWorkspaceFormAccount,
        avatarCid?: string,
    ): IWorkspaceAccount => {
        const { address, network } = account;

        return {
            id: workspaceUtils.buildAccountId({ address, network }),
            type: WorkspaceAccountType.DAO,
            address,
            network,
            metadata: this.buildAccountMetadata(account, avatarCid),
        };
    };

    private buildAccountMetadata = (
        account: ICreateWorkspaceFormAccount,
        avatarCid?: string,
    ): IWorkspaceAccountMetadata | undefined => {
        if (!this.hasMetadata(account)) {
            return undefined;
        }

        const { name, description } = account.metadata!;

        return {
            name: name.trim(),
            description: description.trim() === '' ? undefined : description,
            avatar:
                avatarCid != null ? ipfsUtils.cidToUri(avatarCid) : undefined,
        };
    };
}

export const publishWorkspaceDialogUtils = new PublishWorkspaceDialogUtils();
