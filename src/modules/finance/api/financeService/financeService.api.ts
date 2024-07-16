import type { IPaginatedRequest, IRequestQueryParams } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';

export interface IGetAssetListQueryParams extends IPaginatedRequest {
    /**
     * Address to fetch assets.
     */
    address?: string;
    /**
     * Network of the address to fetch assets.
     */
    network?: Network;
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
