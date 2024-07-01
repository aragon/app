import type { IPaginatedRequest, IRequestQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetAssetListQueryParams extends IPaginatedRequest {
    /**
     * Address to fetch assets.
     */
    address?: string;
    /**
     * Network of the address to fetch assets.
     */
    network?: string;
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
    network?: string;
}

export interface IGetTransactionListParams extends IRequestQueryParams<IGetTransactionListQueryParams> {}
