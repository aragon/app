import type { Address } from 'viem';
import type { IPluginSettings } from '@/shared/api/daoService';

export interface ICrossChainLaneSettings {
    /**
     * Chain ID of the remote chain.
     */
    chainId: number;
    /**
     * Cross-chain adapter, i.e CCIP, on the chain of the DAO.
     */
    localAdapter: Address;
    /**
     * Cross-chain adapter, i.e CCIP, on the remote chain.
     */
    remoteAdapter: Address;
}

export interface ICrossChainControllerPluginSettings extends IPluginSettings {
    /**
     * CrossChainController settings.
     */
    crossChain: {
        /**
         * Executor connected to the controller, i.e. DAO.
         */
        executor: Address;
        /**
         * Available cross-chain lanes.
         */
        lanes: ICrossChainLaneSettings[];
    };
}
