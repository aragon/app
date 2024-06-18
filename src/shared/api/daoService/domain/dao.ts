import type { Network } from '@/shared/types';
import type { IDaoPlugin } from './daoPlugin';

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
     * Defines if the DAO is setup with plugins supported by the App or not.
     */
    isSupported: boolean;
    /**
     * Governance plugins of the DAO.
     */
    plugins: IDaoPlugin[];
}
