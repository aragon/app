import type { Network } from '@/shared/api/daoService';
import type { IRequestBodyParams } from '@/shared/api/httpService';
import type { IWorkspaceAccountRef } from './domain';

/**
 * Maximum number of accounts accepted per request by the workspace query API.
 */
export const workspaceAccountsRequestLimit = 100;

/**
 * Pagination of a workspace query request. Shared by every list endpoint of the API: the pagination travels in the
 * request body, not in the query string, and `pageSize` is capped at 50 by the backend.
 */
export interface IWorkspaceQueryPagination {
    /**
     * Page to read, starting at 1.
     */
    page?: number;
    /**
     * Number of rows per page, capped at 50 by the backend.
     */
    pageSize?: number;
    /**
     * Sort direction.
     */
    order?: 'asc' | 'desc';
    /**
     * Free text search, matching the same fields as the single DAO endpoints.
     */
    search?: string;
}

export interface IGetWorkspaceAccountsBody {
    /**
     * Accounts to resolve. Duplicates are removed and addresses are checksummed by the backend, so the response may
     * be shorter than the request and in a different order — match entries by network and address, never by index.
     */
    accounts: IWorkspaceAccountRef[];
}

export interface IGetWorkspaceAccountsParams
    extends IRequestBodyParams<IGetWorkspaceAccountsBody> {}

export interface IWorkspaceAssetListFilters {
    /**
     * Keeps only the accounts on this network for the request. The other accounts drop out of the data and of the
     * coverage.
     */
    network?: Network;
    /**
     * Keeps only this token. Requires `network`, since the same address is a different token on another chain.
     */
    tokenAddress?: string;
    /**
     * Includes spam-flagged tokens in the rows and in the total.
     * @default false
     */
    includeSpam?: boolean;
}

export interface IGetWorkspaceAssetListBody {
    /**
     * Accounts to aggregate. Max 100; duplicates are removed and addresses checksummed by the backend.
     */
    accounts: IWorkspaceAccountRef[];
    /**
     * Filters narrowing the rows inside the selected accounts. They can never add accounts.
     */
    filters?: IWorkspaceAssetListFilters;
    /**
     * Page to read.
     */
    pagination?: IWorkspaceQueryPagination;
}

export interface IGetWorkspaceAssetListParams
    extends IRequestBodyParams<IGetWorkspaceAssetListBody> {}
