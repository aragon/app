import type { Network } from '@/shared/types';

export interface IDao {
    /**
     * Identifier of the DAO.
     */
    permalink: string;
    /**
     * Address of the DAO.
     * TODO: change attribute name to "address"
     */
    daoAddress: string;
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
}
