import type { IPaginatedRequest, IRequestQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetBalanceListQueryParams extends IPaginatedRequest {}

export interface IGetBalanceListParams extends IRequestQueryParams<IGetBalanceListQueryParams> {}

export interface IGetTransactionListQueryParams extends IPaginatedRequest {
    /**
     * Address of the DAO.
     */
    address?: string;
    /**
     * Network of the DAO.
     */
    network?: string;
}

export interface IGetTransactionListParams extends IRequestQueryParams<IGetTransactionListQueryParams> {}
