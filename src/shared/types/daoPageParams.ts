import type { Network } from '../api/daoService';

export interface IDaoPageParams {
    /**
     * Either address or ens name of the DAO.
     */
    addressOrEns: string;
    /**
     * Network of the DAO, i.e. ethereum-mainnet.
     */
    network: Network;
}
