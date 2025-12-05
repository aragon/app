import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { IRequestQueryParams } from '@/shared/api/httpService';

export interface IGetAssetListQueryParams extends IPaginatedRequest {
    /**
     * DAO ID to fetch assets (format: {network}-{address}).
     * When querying the parent DAO, returns aggregated data for parent + all SubDAOs.
     * When querying a specific SubDAO, returns data only for that SubDAO.
     */
    daoId: string;
    /**
     * When true, returns only the parent DAO's assets (excludes SubDAOs).
     * Used to differentiate between "All Assets" (parent + SubDAOs) and "Parent DAO" tab (parent only).
     */
    onlyParent?: boolean;
}

export interface IGetAssetListParams extends IRequestQueryParams<IGetAssetListQueryParams> {}

export interface IGetTransactionListQueryParams extends IPaginatedRequest {
    /**
     * ID of the DAO to fetch transactions from (format: {network}-{address}).
     * When querying the parent DAO, returns aggregated data for parent + all SubDAOs.
     * When querying a specific SubDAO, returns data only for that SubDAO.
     */
    daoId?: string;
    /**
     * Optional address to filter transactions to a specific SubDAO.
     * When omitted, returns transactions from parent DAO + all SubDAOs.
     */
    address?: string;
    /**
     * When true, returns only the parent DAO's transactions (excludes SubDAOs).
     * Used to differentiate between "All Transactions" (parent + SubDAOs) and "Parent DAO" tab (parent only).
     */
    onlyParent?: boolean;
}

export interface IGetTransactionListParams extends IRequestQueryParams<IGetTransactionListQueryParams> {}
