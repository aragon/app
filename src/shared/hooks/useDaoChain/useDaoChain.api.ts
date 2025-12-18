import type { ChainEntityType } from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import type { INetworkDefinition } from '@/shared/constants/networkDefinitions';

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
     * The network definition for the DAO's network.
     */
    networkDefinition: INetworkDefinition | undefined;
    /**
     * Build block explorer URLs for the chain.
     */
    buildEntityUrl: (params: { type: ChainEntityType; id?: string; chainId?: number }) => string | undefined;
    /**
     * Whether DAO data is loading.
     */
    isLoading: boolean;
}
