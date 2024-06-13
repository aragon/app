import type { IRequestUrlQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetMultisigMemberListUrlParams {
    /**
     * Slug of the DAO to fetch the members from.
     */
    slug: string;
}

export interface IGetMultisigMemberListQueryParams {
    /**
     * Plugin address to fetch the members from.
     */
    pluginAddress: string;
}

export interface IGetMultisigMemberListParams
    extends IRequestUrlQueryParams<IGetMultisigMemberListUrlParams, IGetMultisigMemberListQueryParams> {}
