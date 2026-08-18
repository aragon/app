import type { Address } from 'viem';
import type { IToken } from '@/modules/finance/api/financeService';
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
    /**
     * Fee token address, set on local adapter.
     */
    feeToken?: Address;
    /**
     * Metadata of the fee token, indexed by the backend from the `feeToken` address. Undefined when
     * the lane has no fee token or the token has not been indexed yet. The total supply is not part
     * of the lane projection.
     */
    token?: Omit<IToken, 'totalSupply'>;
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
