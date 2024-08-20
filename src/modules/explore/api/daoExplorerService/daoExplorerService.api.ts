import type { IOrderedRequest, IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { IRequestQueryParams } from '@/shared/api/httpService';

export interface IGetDaoListQueryParams extends IPaginatedRequest, IOrderedRequest {}

export interface IGetDaoListParams extends IRequestQueryParams<IGetDaoListQueryParams> {}
