import type { IAddressInfo } from './addressInfo';
import type { IDaoMetrics } from './daoMetrics';
import type { IDaoPlugin } from './daoPlugin';
import type { Network } from './enum';
import type { IResource } from './resource';

/**
 * Summary of a linked account (child DAO) without plugins.
 */
export interface ILinkedAccountSummary {
    /**
     * Identifier of the linked account.
     */
    id: string;
    /**
     * Address of the linked account.
     */
    address: string;
    /**
     * Network of the linked account.
     */
    network: Network;
    /**
     * Name of the linked account.
     */
    name: string;
    /**
     * Description of the linked account.
     */
    description: string;
    /**
     * ENS name of the linked account (e.g. `my-dao.dao.eth`).
     */
    ens: string | null;
    /**
     * ENS subdomain of the linked account.
     */
    subdomain: string | null;
    /**
     * Avatar of the linked account or null when linked account has no avatar.
     */
    avatar: string | null;
    /**
     * Metrics of the linked account.
     */
    metrics: IDaoMetrics;
    /**
     * Links of the linked account.
     */
    links: IResource[];
    /**
     * Linked account creation date by block timestamp (in seconds).
     */
    blockTimestamp: number;
    /**
     * Transaction hash of the linked account creation.
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
     * Linked accounts (child DAOs) of this DAO.
     */
    linkedAccounts?: ILinkedAccountSummary[];
    /**
     * Creator information of the DAO.
     */
    creator?: IAddressInfo;
}
