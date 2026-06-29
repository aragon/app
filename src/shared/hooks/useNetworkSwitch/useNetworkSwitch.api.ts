import type { Network } from '@/shared/api/daoService';
import type { TransactionStatusState } from '@/shared/components/transactionStatus';

export interface IUseNetworkSwitchParams {
    /** Network the transaction must be sent on; resolves the required chain synchronously. */
    network: Network;
}

export interface IUseNetworkSwitchReturn {
    /** Chain ID the transaction must be sent on, for pinning the send to the correct chain. */
    requiredChainId: number;
    /** Whether the wallet's current chain differs from the required chain. */
    isCrossNetworkTransaction: boolean;
    /** Human-readable name of the required network (e.g. "Ethereum"), for UI alerts. */
    networkName: string;
    /** Status of the chain-switch mutation. */
    switchChainStatus: TransactionStatusState;
    /** Wraps a callback so that, if a chain switch is needed, it switches first and calls the callback on success. If no switch is needed, calls the callback directly. */
    withNetworkSwitch: (onSend: () => void) => void;
}
