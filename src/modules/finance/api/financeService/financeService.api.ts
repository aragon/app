import type { IPaginatedRequest, IRequestQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetBalanceListQueryParams extends IPaginatedRequest {}

export interface IGetBalanceListParams extends IRequestQueryParams<IGetBalanceListQueryParams> {}

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
