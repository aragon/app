import { IDaoLink } from './daoLink';
import type { IDaoMetrics } from './daoMetrics';
import type { IDaoPlugin } from './daoPlugin';
import { type Network } from './enum';

export interface IDao {
    /**
     * Identifier of the DAO.
     */
    id: string;
    /**
     * Address of the DAO.
     */
    address: string;
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Name of the DAO.
     */
    name: string;
    /**
     * Description of the DAO.
     */
    description: string;
    /**
     * ENS of the DAO or null when DAO has no ENS linked.
     */
    ens: string | null;
    /**
     * Avatar of the DAO or null when DAO has no avatar.
     */
    avatar: string | null;
    /**
     * Total value locked of the DAO.
     */
    tvlUSD: string;
    /**
     * Defines if the DAO is setup with plugins supported by the App or not.
     */
    isSupported: boolean;
    /**
     * Governance plugins of the DAO.
     */
    plugins: IDaoPlugin[];
    /**
     * Metrics of the DAO.
     */
    metrics: IDaoMetrics;
    /**
     * Links of the DAO.
     */
    links: IDaoLink[];
    /**
     * DAO creation date by block timestamp.
     */
    blockTimestamp: number;
}
