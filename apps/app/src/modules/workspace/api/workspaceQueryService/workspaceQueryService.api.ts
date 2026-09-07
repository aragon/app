import type { IRequestBodyParams } from '@/shared/api/httpService';
import type { IWorkspaceAccountRef } from './domain';

/**
 * Maximum number of accounts accepted per request by the workspace query API.
 */
export const workspaceAccountsRequestLimit = 100;

export interface IGetWorkspaceAccountsBody {
    /**
     * Accounts to resolve. Duplicates are removed and addresses are checksummed by the backend, so the response may
     * be shorter than the request and in a different order — match entries by network and address, never by index.
     */
    accounts: IWorkspaceAccountRef[];
}

export interface IGetWorkspaceAccountsParams
    extends IRequestBodyParams<IGetWorkspaceAccountsBody> {}
