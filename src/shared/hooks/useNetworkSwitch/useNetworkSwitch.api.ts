import type { Network } from '@/shared/api/daoService';
import type { TransactionStatusState } from '@/shared/components/transactionStatus';

export interface IUseNetworkSwitchParams {
    /** Network to resolve the required chain from. */
    network?: Network;
    /** DAO ID to derive the required chain from (fetches DAO if network/chainId not provided). */
    daoId?: string;
    /** Required chain ID to use directly (bypasses DAO and network resolution). */
    chainId?: number;
}

export interface IUseNetworkSwitchReturn {
    /** Whether the wallet's current chain differs from the required chain. */
    isCrossNetworkTransaction: boolean;
    /** Human-readable name of the required network (e.g. "Ethereum"), for UI alerts. */
    networkName: string | undefined;
    /** Status of the chain-switch mutation. */
    switchChainStatus: TransactionStatusState;
    /** Wraps a callback so that, if a chain switch is needed, it switches first and calls the callback on success. If no switch is needed, calls the callback directly. */
    withNetworkSwitch: (onSend: () => void) => void;
    /** Whether the required chain is still loading (only when resolving via daoId). */
    isLoading: boolean;
}
