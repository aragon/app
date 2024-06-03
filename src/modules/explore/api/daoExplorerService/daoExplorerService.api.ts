import type { IOrderedRequest, IPaginatedRequest, IRequestQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetDaoListQueryParams extends IPaginatedRequest, IOrderedRequest {}

export interface IGetDaoListParams extends IRequestQueryParams<IGetDaoListQueryParams> {}
