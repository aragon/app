import type { IRequestUrlParams, IRequestUrlQueryParams } from '../httpService';
import type { Network, PluginInterfaceType } from './domain';
import type { PluginStatus } from './domain/enum';

export interface IGetDaoUrlParams {
    /**
     * ID of the DAO to be fetched.
     */
    id: string;
}

export interface IGetDaoParams extends IRequestUrlParams<IGetDaoUrlParams> {}

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

export interface IGetPluginsByDaoUrlParams {
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Address of the DAO.
     */
    daoAddress: string;
}

export interface IGetPluginsByDaoQueryParams {
    /**
     * Filter by plugin status.
     */
    status?: PluginStatus;
    /**
     * Filter by plugin interface type.
     */
    interfaceType?: PluginInterfaceType;
}

export interface IGetPluginsByDaoParams
    extends IRequestUrlQueryParams<IGetPluginsByDaoUrlParams, IGetPluginsByDaoQueryParams> {}
