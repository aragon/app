import type { IDaoLink } from './daoLink';
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
     * ENS of the DAO under the dao.eth subdomain.
     */
    subdomain: string | null;
    /**
     * Avatar of the DAO or null when DAO has no avatar.
     */
    avatar: string | null;
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
     * DAO creation date by block timestamp (in seconds).
     */
    blockTimestamp: number;
    /**
     * Transaction hash of the DAO creation.
     */
    transactionHash: string;
}
