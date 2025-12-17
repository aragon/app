import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IRequestUrlQueryParams } from '@/shared/api/httpService';

export interface IGetAllowedActionsQueryParams extends IPaginatedRequest {}

export interface IGetAllowedActionsUrlParams {
    /**
     * Network of the plugin.
     */
    network: Network;
    /**
     * Address of the plugin for which the actions are allowed.
     */
    pluginAddress: string;
}

export interface IGetAllowedActionsParams extends IRequestUrlQueryParams<IGetAllowedActionsUrlParams, IGetAllowedActionsQueryParams> {}
