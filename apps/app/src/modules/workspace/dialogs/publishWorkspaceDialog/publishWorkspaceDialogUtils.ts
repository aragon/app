import { type IInputFileAvatarValue, invariant } from '@aragon/gov-ui-kit';
import type { IWorkspaceAccountInfo } from '../../api/workspaceQueryService';
import type {
    ICreateWorkspaceBody,
    IWorkspaceAccount,
    IWorkspaceAccountMetadata,
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
     * IPFS URI of the workspace avatar, undefined when the workspace has no avatar.
     */
    avatarUri?: string;
    /**
     * IPFS URIs of the account avatars, ordered as the accounts of the form values.
     */
    accountAvatarUris: (string | undefined)[];
    /**
     * Accounts as resolved by the workspace accounts API, used to store the type of each account.
     */
    accountInfos: IWorkspaceAccountInfo[];
}

class PublishWorkspaceDialogUtils {
    /**
     * Builds the workspace to be persisted from the form values and avatar URIs.
     * @param params - Form values, avatar URIs and resolved accounts.
     * @returns The workspace to be sent to the registry, without an ID as it is assigned by the registry.
     */
    buildWorkspace = (params: IBuildWorkspaceParams): ICreateWorkspaceBody => {
        const { values, avatarUri, accountAvatarUris, accountInfos } = params;
        const { name, description, resources, targets, accounts } = values;

        return {
            name,
            description,
            avatar: avatarUri ?? null,
            links: resources,
            accounts: accounts.map((account, index) =>
                this.buildAccount(
                    account,
                    accountInfos,
                    accountAvatarUris[index],
                ),
            ),
            targets: targets.map(({ address, network }) => ({
                address,
                network,
            })),
        };
    };

    /**
     * Returns the avatars to be stored for the given accounts, ordered as the accounts themselves.
     * @param accounts - Accounts of the create-workspace form.
     * @returns One entry per account, undefined when the account has no avatar to store.
     */
    getAccountAvatars = (
        accounts: ICreateWorkspaceFormAccount[],
    ): (IInputFileAvatarValue | undefined)[] =>
        accounts.map((account) =>
            this.hasMetadata(account) ? account.metadata?.avatar : undefined,
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
        accountInfos: IWorkspaceAccountInfo[],
        avatarUri?: string,
    ): IWorkspaceAccount => {
        const { address, network } = account;

        const accountInfo = workspaceUtils.findAccountInfo(accountInfos, {
            address,
            network,
        });
        const type = workspaceUtils.getAccountType(accountInfo);

        // The address was validated against the same API while the form was filled in, so an unresolved account
        // here means it stopped resolving in the meantime. Storing a guessed type would corrupt the registry.
        invariant(
            type != null,
            `PublishWorkspaceDialogUtils: unable to resolve the type of the account (network=${network}, address=${address}).`,
        );

        return {
            id: workspaceUtils.buildAccountId({ address, network }),
            type,
            address,
            network,
            metadata: this.buildAccountMetadata(account, avatarUri),
        };
    };

    private buildAccountMetadata = (
        account: ICreateWorkspaceFormAccount,
        avatarUri?: string,
    ): IWorkspaceAccountMetadata | undefined => {
        if (!this.hasMetadata(account)) {
            return undefined;
        }

        const { name, description } = account.metadata!;

        return {
            name: name.trim(),
            description: description.trim() === '' ? undefined : description,
            avatar: avatarUri,
        };
    };
}

export const publishWorkspaceDialogUtils = new PublishWorkspaceDialogUtils();
