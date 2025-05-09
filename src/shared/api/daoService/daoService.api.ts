import type { IRequestUrlParams } from '../httpService';
import type { Network } from './domain';

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
     * ENS name of the DAO to be fetched.
     */
    ens: string;
}

export interface IGetDaoByEnsParams extends IRequestUrlParams<IGetDaoByEnsUrlParams> {}
