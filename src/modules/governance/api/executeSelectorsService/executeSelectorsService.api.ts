import type { Network } from '@/shared/api/daoService';
import type { IPaginatedRequest } from '../../../../shared/api/aragonBackendService';
import type { IRequestUrlQueryParams } from '../../../../shared/api/httpService';

export interface IGetAllowedActionsQueryParams extends IPaginatedRequest {}

export interface IGetAllowedActionsUrlParams {
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Plugin address of the process on which the actions are allowed.
     */
    pluginAddress: string;
}

export interface IGetAllowedActionsParams
    extends IRequestUrlQueryParams<IGetAllowedActionsUrlParams, IGetAllowedActionsQueryParams> {}
