import type { IRequestUrlQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetTokenMemberListUrlParams {
    /**
     * Slug of the DAO to fetch the members from.
     */
    slug: string;
}

export interface IGetTokenMemberListQueryParams {
    /**
     * Plugin address to fetch the members from.
     */
    pluginAddress: string;
}

export interface IGetTokenMemberListParams
    extends IRequestUrlQueryParams<IGetTokenMemberListUrlParams, IGetTokenMemberListQueryParams> {}
