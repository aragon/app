import type { TransactionTransferSide } from '@/modules/finance/api/financeService';
import type { IRequestQueryParams } from '@/shared/api/httpService';

export interface IGetWorkspaceAssetListQueryParams {
    /**
     * IDs of the DAOs to aggregate the assets of (format: {network}-{address}). Each ID is queried without
     * `onlyParent`, so an account that is a parent DAO contributes its linked accounts too.
     */
    daoIds: string[];
    /**
     * Number of assets to request per page from each account.
     */
    pageSize?: number;
}

export interface IGetWorkspaceAssetListParams
    extends IRequestQueryParams<IGetWorkspaceAssetListQueryParams> {}

export interface IGetWorkspaceTransactionListQueryParams {
    /**
     * IDs of the DAOs to aggregate the transactions of (format: {network}-{address}). Each ID is queried without
     * `onlyParent`, so an account that is a parent DAO contributes its linked accounts too.
     */
    daoIds: string[];
    /**
     * Number of transactions to request per page from each account.
     */
    pageSize?: number;
    /**
     * Optional transfer direction filter.
     */
    side?: TransactionTransferSide;
    /**
     * Optional transaction type filter.
     */
    type?: 'execution';
}

export interface IGetWorkspaceTransactionListParams
    extends IRequestQueryParams<IGetWorkspaceTransactionListQueryParams> {
    /**
     * Page to fetch for each DAO ID on this request, keyed by DAO ID. Accounts missing from this map are not fetched,
     * which is what lets the merge advance only the accounts that are holding the list back. Defaults to page 1 for
     * every account of `queryParams.daoIds`.
     */
    pages?: Record<string, number>;
}

export interface IGetWorkspaceTransactionAvailabilityQueryParams {
    /**
     * IDs of the DAOs to count the transactions of (format: {network}-{address}).
     */
    daoIds: string[];
    /**
     * Optional transfer direction filter.
     */
    side?: TransactionTransferSide;
    /**
     * Optional transaction type filter.
     */
    type?: 'execution';
}

export interface IGetWorkspaceTransactionAvailabilityParams
    extends IRequestQueryParams<IGetWorkspaceTransactionAvailabilityQueryParams> {}
