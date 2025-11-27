import type { Network } from '../daoService';
import type { IRequestUrlParams } from '../httpService';

export interface IGetPluginsByDaoUrlParams {
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Address of the DAO.
     */
    address: string;
}

export interface IGetPluginsByDaoParams extends IRequestUrlParams<IGetPluginsByDaoUrlParams> {}
