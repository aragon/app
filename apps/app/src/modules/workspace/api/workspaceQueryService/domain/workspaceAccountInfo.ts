import type { Network } from '@/shared/api/daoService';
import type {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from './enum';

export interface IWorkspaceAccountRef {
    /**
     * Network the address lives on.
     */
    network: Network;
    /**
     * Address of the account.
     */
    address: string;
}

export interface IWorkspaceAccountInfoError {
    /**
     * Error code reported by the source, e.g. a Safe service error code.
     */
    code: string;
    /**
     * Seconds to wait before retrying, set when the source is rate limited.
     */
    retryAfter?: number;
}

/**
 * What an address is, as resolved by the workspace accounts API.
 *
 * Named `Info` to avoid clashing with `IWorkspaceAccount`, which is the account as stored on the workspace
 * registry. This one is a lookup result, not stored state, and the `safe` field of the response is intentionally
 * not modelled: nothing in the create flow needs the Safe configuration.
 */
export interface IWorkspaceAccountInfo extends IWorkspaceAccountRef {
    /**
     * Type of the address.
     */
    type: WorkspaceAccountInfoType;
    /**
     * Whether the source backing the address could be read.
     */
    status: WorkspaceAccountInfoStatus;
    /**
     * Whether the address is indexed by the backend, i.e. true for DAO accounts only.
     */
    indexed: boolean;
    /**
     * Name of the DAO, set for indexed DAO accounts.
     */
    name?: string | null;
    /**
     * Error reported by the source, set when the status is not available.
     */
    error?: IWorkspaceAccountInfoError;
}
