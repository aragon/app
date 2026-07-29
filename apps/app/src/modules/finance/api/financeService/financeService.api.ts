import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type {
    IRequestQueryParams,
    IRequestUrlParams,
} from '@/shared/api/httpService';
import type { TransactionTransferSide } from './domain';

export interface IGetAssetListQueryParams extends IPaginatedRequest {
    /**
     * DAO ID to fetch assets (format: {network}-{address}).
     * When querying the parent DAO, returns aggregated data for parent + all linked accounts.
     * When querying a specific linked account, returns data only for that linked account.
     */
    daoId: string;
    /**
     * When true, returns only the parent DAO's assets (excludes linked accounts).
     * Used to differentiate between "All Assets" (parent + linked accounts) and "Parent DAO" tab (parent only).
     */
    onlyParent?: boolean;
}

export interface IGetAssetListParams
    extends IRequestQueryParams<IGetAssetListQueryParams> {}

export interface IGetTransactionListQueryParams extends IPaginatedRequest {
    /**
     * ID of the DAO to fetch transactions from (format: {network}-{address}).
     * When querying the parent DAO, returns aggregated data for parent + all linked accounts.
     * When querying a specific linked account, returns data only for that linked account.
     */
    daoId?: string;
    /**
     * Optional address to filter transactions to a specific linked account.
     * When omitted, returns transactions from parent DAO + all linked accounts.
     */
    address?: string;
    /**
     * When true, returns only the parent DAO's transactions (excludes linked accounts).
     * Used to differentiate between "All Transactions" (parent + linked accounts) and "Parent DAO" tab (parent only).
     */
    onlyParent?: boolean;
    /**
     * Optional transfer direction filter.
     */
    side?: TransactionTransferSide;
    /**
     * Optional transaction type filter.
     */
    type?: 'execution';
}

export interface IGetTransactionListParams
    extends IRequestQueryParams<IGetTransactionListQueryParams> {}

export interface IGetTransactionActionsUrlParams {
    /**
     * Network identifier for the execution transaction.
     */
    network: Network;
    /**
     * ID of the execution transaction.
     */
    id: string;
}

export interface IGetTransactionActionsParams
    extends IRequestUrlParams<IGetTransactionActionsUrlParams> {}
