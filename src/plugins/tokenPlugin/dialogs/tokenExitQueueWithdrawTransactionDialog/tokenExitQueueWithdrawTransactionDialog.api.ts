import type { IToken } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import type { Address } from 'viem';

export interface ITokenExitQueueWithdrawTransactionDialogParams {
    /**
     * Token ID for the VotingEscrow NFT.
     */
    tokenId: bigint;
    /**
     * Token configuration for display.
     */
    token: IToken;
    /**
     * Address of the DynamicExitQueue contract (lock manager).
     */
    lockManagerAddress: Address;
    /**
     * Network where the transaction should execute.
     */
    network: Network;
    /**
     * Optional callback triggered on successful withdrawal.
     */
    onSuccess?: () => void;
}

export interface ITokenExitQueueWithdrawTransactionDialogProps
    extends IDialogComponentProps<ITokenExitQueueWithdrawTransactionDialogParams> {}
