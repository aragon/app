import type { IPaginatedRequest } from '../aragonBackendService';
import type { IRequestUrlParams, IRequestUrlQueryParams } from '../httpService';
import type { Network } from './domain';

export interface IGetDaoUrlParams {
    /**
     * ID of the DAO to be fetched.
     */
    id: string;
}

export interface IGetDaoQueryParams {
    /**
     * When true, returns only the parent DAO's metrics (excludes SubDAOs from aggregation).
     * Used to differentiate between "All Assets" (parent + SubDAOs) and "Parent DAO" tab.
     */
    onlyParent?: boolean;
}

export interface IGetDaoParams extends IRequestUrlParams<IGetDaoUrlParams> {
    /**
     * Optional query parameters.
     */
    queryParams?: IGetDaoQueryParams;
}

export interface IGetDaoByEnsUrlParams {
    /**
     * Network of the DAO to be fetched.
     */
    network: Network;
    /**
     * ENS of the DAO to be fetched.
     */
    ens: string;
}

export interface IGetDaoByEnsParams extends IRequestUrlParams<IGetDaoByEnsUrlParams> {}

export interface IGetDaoPermissionsUrlParams {
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Address of the DAO to fetch permissions for.
     */
    daoAddress: string;
}

export interface IGetDaoPermissionsQueryParams extends IPaginatedRequest {}

export interface IGetDaoPermissionsParams extends IRequestUrlQueryParams<IGetDaoPermissionsUrlParams, IGetDaoPermissionsQueryParams> {}

export interface IGetDaoPoliciesUrlParams {
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Address of the DAO to fetch policies for.
     */
    daoAddress: string;
}

export interface IGetDaoPoliciesParams extends IRequestUrlParams<IGetDaoPoliciesUrlParams> {}
