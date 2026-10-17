import type { Network } from '@/shared/api/daoService';

export interface IWorkspaceTarget {
    /**
     * Address of the target.
     */
    address: string;
    /**
     * Network the target lives on.
     */
    network: Network;
}
