import type { IPaginatedRequest, IRequestQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetDaoListQueryParams extends IPaginatedRequest {}

export interface IGetDaoListParams extends IRequestQueryParams<IGetDaoListQueryParams> {}
