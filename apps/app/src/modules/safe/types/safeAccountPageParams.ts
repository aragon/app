import type { Network } from '@/shared/api/daoService';

export interface ISafeAccountPageParams {
    /**
     * Network the Safe is deployed on, i.e. ethereum-mainnet.
     */
    network: Network;
    /**
     * Address of the Safe.
     */
    address: string;
}
