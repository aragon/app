import type { IPaginatedRequest, IRequestQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetBalanceListQueryParams extends IPaginatedRequest {}

export interface IGetBalanceListParams extends IRequestQueryParams<IGetBalanceListQueryParams> {}
