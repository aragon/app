import type { IPaginatedRequest, IRequestQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetBalanceListQueryParams extends IPaginatedRequest {}

export interface IGetBalanceListParams extends IRequestQueryParams<IGetBalanceListQueryParams> {}

export interface IGetTransactionListQueryParams extends IPaginatedRequest {}

export interface IGetTransactionListParams extends IRequestQueryParams<IGetBalanceListQueryParams> {}
