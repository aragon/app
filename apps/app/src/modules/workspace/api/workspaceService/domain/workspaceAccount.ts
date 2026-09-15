import type { Network } from '@/shared/api/daoService';
import type { WorkspaceAccountType } from './enum';

export interface IWorkspaceAccountMetadata {
    /**
     * Display name of the account.
     */
    name: string;
    /**
     * Description of the account.
     */
    description?: string;
    /**
     * Avatar of the account.
     */
    avatar?: string;
}

export interface IWorkspaceAccount {
    /**
     * Identifier of the account (format: {network}-{address}). Matches the DAO ID for DAO accounts, so it can be
     * passed straight to the backend as the `daoId` query parameter.
     */
    id: string;
    /**
     * Type of the account, used to resolve which APIs to query for it.
     */
    type: WorkspaceAccountType;
    /**
     * Address of the account.
     */
    address: string;
    /**
     * Network the account lives on.
     */
    network: Network;
    /**
     * Optional metadata overrides for accounts that have no on-chain metadata of their own (e.g. Safe accounts).
     * DAO accounts resolve their metadata from the DAO API, so this is left undefined for them.
     */
    metadata?: IWorkspaceAccountMetadata;
}
