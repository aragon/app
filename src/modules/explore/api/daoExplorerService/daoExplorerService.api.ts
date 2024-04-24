import type { IPaginatedRequest, IRequestParams } from '@/shared/api/aragonBackendService';

export interface IGetDaoListQueryParams extends IPaginatedRequest {}

export interface IGetDaoListParams extends IRequestParams<undefined, IGetDaoListQueryParams> {}
