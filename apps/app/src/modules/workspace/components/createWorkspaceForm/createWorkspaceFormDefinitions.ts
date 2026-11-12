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
     * Address of the account or target.
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
     * Targets of the workspace, used for account discovery later on.
     */
    targets: ICreateWorkspaceFormNetworkAddress[];
    /**
     * Accounts belonging to the workspace.
     */
    accounts: ICreateWorkspaceFormAccount[];
}

/**
 * Empty network-address row appended when the user adds a target or an account.
 */
export const createWorkspaceFormEmptyNetworkAddress: ICreateWorkspaceFormNetworkAddress =
    { address: '', network: Network.ETHEREUM_SEPOLIA };

/**
 * Default values of the create-workspace form. Optional field arrays start empty;
 * their controls append the first row when the user chooses to add one.
 */
export const createWorkspaceFormDefaultValues: Pick<
    ICreateWorkspaceFormData,
    'targets' | 'accounts'
> = {
    // Targets are optional, therefore the list starts empty.
    targets: [],
    accounts: [],
};
