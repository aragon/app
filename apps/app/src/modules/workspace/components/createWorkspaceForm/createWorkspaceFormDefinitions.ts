import type { IInputFileAvatarValue } from '@aragon/gov-ui-kit';
import { Network } from '@/shared/api/daoService';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';

export interface ICreateWorkspaceFormMetadataData {
    /**
     * Name of the workspace.
     */
    name: string;
    /**
     * Avatar of the workspace.
     */
    avatar?: IInputFileAvatarValue;
    /**
     * Description of the workspace.
     */
    description: string;
    /**
     * Resources of the workspace.
     */
    resources: IResourcesInputResource[];
}

export interface ICreateWorkspaceFormNetworkAddress {
    /**
     * Network the address lives on.
     */
    network: Network;
    /**
     * Address of the account.
     */
    address: string;
}

export interface ICreateWorkspaceFormAccountMetadata {
    /**
     * Display name of the account.
     */
    name: string;
    /**
     * Description of the account.
     */
    description: string;
    /**
     * Avatar of the account.
     */
    avatar?: IInputFileAvatarValue;
}

export interface ICreateWorkspaceFormAccount
    extends ICreateWorkspaceFormNetworkAddress {
    /**
     * Optional metadata of the account, only set when the user fills the account metadata section.
     */
    metadata?: ICreateWorkspaceFormAccountMetadata;
}

export interface ICreateWorkspaceFormData
    extends ICreateWorkspaceFormMetadataData {
    /**
     * Accounts belonging to the workspace.
     */
    accounts: ICreateWorkspaceFormAccount[];
}

/**
 * Empty network-address row appended when the user adds an account.
 */
export const createWorkspaceFormEmptyNetworkAddress: ICreateWorkspaceFormNetworkAddress =
    { address: '', network: Network.ETHEREUM_SEPOLIA };

/**
 * Default values of the create-workspace form. The accounts field-array is seeded here, at the form root, so that
 * `useFieldArray` sees it on the very first render: seeding it from the list component instead would either
 * render an empty list on mount or need an effect that mutates the form while the rows are already mounting.
 */
export const createWorkspaceFormDefaultValues: Pick<
    ICreateWorkspaceFormData,
    'accounts'
> = {
    // Accounts are optional; one removable row makes adding one the obvious path.
    accounts: [createWorkspaceFormEmptyNetworkAddress],
};
