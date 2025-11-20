import type { Network } from '@/shared/api/daoService';
import type { ChainEntityType } from '@aragon/gov-ui-kit';

export interface IUseDaoChainParams {
    /**
     * DAO ID to derive chain context from.
     */
    daoId?: string;
    /**
     * Network to use directly (bypasses DAO fetch if provided).
     */
    network?: Network;
    /**
     * Chain ID to use directly (bypasses DAO and network if provided).
     */
    chainId?: number;
}

export interface IUseDaoChainReturn {
    /**
     * Chain ID for the DAO's network.
     */
    chainId: number | undefined;
    /**
     * Network for the DAO.
     */
    network: Network | undefined;
    /**
     * Build block explorer URLs for the chain.
     */
    buildEntityUrl: (params: { type: ChainEntityType; id?: string; chainId?: number }) => string | undefined;
    /**
     * Whether DAO data is loading.
     */
    isLoading: boolean;
}
