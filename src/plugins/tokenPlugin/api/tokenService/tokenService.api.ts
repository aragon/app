import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IRequestUrlQueryParams } from '@/shared/api/httpService';

export interface IGetMemberLocksUrlParams {
    /**
     * Address of the member to fetch the locks for.
     */
    address: string;
}

export interface IGetMemberLocksQueryParams extends IPaginatedRequest {
    /**
     * Address of the plugin.
     */
    pluginAddress?: string;
    /**
     * Network of the lock.
     */
    network: Network;
    /**
     * Flag to determine whether or not to fetch only active locks.
     */
    onlyActive?: boolean;
    /**
     * Address of the locked token.
     */
    tokenAddress?: string;
}

export interface IGetMemberLocksParams
    extends IRequestUrlQueryParams<IGetMemberLocksUrlParams, IGetMemberLocksQueryParams> {}
