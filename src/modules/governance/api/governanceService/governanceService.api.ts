import type { IPaginatedRequest, IRequestQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetMemberListQueryParams extends IPaginatedRequest {
    /**
     * ID of the Dao to fetch the members from.
     */
    daoId: string;
}

export interface IGetMemberListParams extends IRequestQueryParams<IGetMemberListQueryParams> {}
