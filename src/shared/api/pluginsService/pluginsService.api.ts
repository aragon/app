import type { Network } from '../daoService';
import type { IRequestUrlParams } from '../httpService';

export interface IGetDaoPluginsByDaoUrlParams {
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Address of the DAO.
     */
    address: string;
}

export interface IGetDaoPluginsByDaoParams extends IRequestUrlParams<IGetDaoPluginsByDaoUrlParams> {}
