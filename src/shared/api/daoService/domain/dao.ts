import type { IAddressInfo } from './addressInfo';
import type { IDaoMetrics } from './daoMetrics';
import type { IDaoPlugin } from './daoPlugin';
import type { Network } from './enum';
import type { IResource } from './resource';

/**
 * Summary of a SubDAO (child DAO) without plugins.
 */
export interface ISubDaoSummary {
    /**
     * Identifier of the SubDAO.
     */
    id: string;
    /**
     * Address of the SubDAO.
     */
    address: string;
    /**
     * Network of the SubDAO.
     */
    network: Network;
    /**
     * Name of the SubDAO.
     */
    name: string;
    /**
     * Description of the SubDAO.
     */
    description: string;
    /**
     * ENS name of the SubDAO (e.g. `my-dao.dao.eth`).
     */
    ens: string | null;
    /**
     * ENS subdomain of the SubDAO.
     */
    subdomain: string | null;
    /**
     * Avatar of the SubDAO or null when SubDAO has no avatar.
     */
    avatar: string | null;
    /**
     * Metrics of the SubDAO.
     */
    metrics: IDaoMetrics;
    /**
     * Links of the SubDAO.
     */
    links: IResource[];
    /**
     * SubDAO creation date by block timestamp (in seconds).
     */
    blockTimestamp: number;
    /**
     * Transaction hash of the SubDAO creation.
     */
    transactionHash: string;
}

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
     * ENS name of the DAO (e.g. `my-dao.dao.eth`).
     */
    ens: string | null;
    /**
     * ENS subdomain of the DAO.
     */
    subdomain: string | null;
    /**
     * Avatar of the DAO or null when DAO has no avatar.
     */
    avatar: string | null;
    /**
     * OSx version of the DAO.
     */
    version: string;
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
    links: IResource[];
    /**
     * DAO creation date by block timestamp (in seconds).
     */
    blockTimestamp: number;
    /**
     * Transaction hash of the DAO creation.
     */
    transactionHash: string;
    /**
     * SubDAOs (child DAOs) of this DAO.
     */
    subDaos?: ISubDaoSummary[];
    /**
     * Creator information of the DAO.
     */
    creator?: IAddressInfo;
}
