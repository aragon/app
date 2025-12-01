import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IRequestQueryParams } from '@/shared/api/httpService';

export interface IGetAssetListQueryParams extends IPaginatedRequest {
    /**
     * DAO ID to fetch assets (format: {network}-{address}).
     * When querying the parent DAO, returns aggregated data for parent + all SubDAOs.
     * When querying a specific SubDAO, returns data only for that SubDAO.
     */
    daoId?: string;
}

export interface IGetAssetListParams extends IRequestQueryParams<IGetAssetListQueryParams> {}

export interface IGetTransactionListQueryParams extends IPaginatedRequest {
    /**
     * Address to fetch transaction history.
     */
    address?: string;
    /**
     * Network of the address to fetch transaction history.
     */
    network?: Network;
}

export interface IGetTransactionListParams extends IRequestQueryParams<IGetTransactionListQueryParams> {}
