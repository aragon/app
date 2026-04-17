import type { Network } from '@/shared/api/daoService';

export interface IFeaturedDelegates {
    /**
     * Contract address of the DAO.
     */
    daoAddress: string;
    /**
     * Contract address of the token voting plugin.
     */
    pluginAddress: string;
    /**
     * The network on which the DAO is deployed.
     */
    network: Network;
    /**
     * List of featured delegate addresses.
     */
    delegates: string[];
}
