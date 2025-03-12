import type { Network } from '@/shared/api/daoService';

export interface IFeaturedDao {
    /**
     * Name of the DAO.
     */
    name: string;
    /**
     * Description of the DAO.
     */
    description: string;
    /**
     * Avatar of the DAO.
     */
    logo?: string;
    /**
     * The network on which the DAO is deployed.
     */
    network: Network;
    /**
     * Contract address of the DAO.
     */
    daoAddress: string;
    /**
     * External URL of the DAO. Overrides the default internal URL.
     */
    overrideUrl?: string;
}
