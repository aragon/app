import type { Address } from 'viem';
import type { IToken } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';

export interface IGaugeVoterExitQueueWithdrawTransactionDialogParams {
    /**
     * Token ID for the VotingEscrow NFT.
     */
    tokenId: bigint;
    /**
     * Token configuration for display.
     */
    token: IToken;
    /**
     * Address of the VotingEscrow contract where withdraw is called.
     */
    escrowAddress: Address;
    /**
     * Network where the transaction should execute.
     */
    network: Network;
    /**
     * Optional callback triggered on successful withdrawal.
     */
    onSuccess?: () => void;
}

export interface IGaugeVoterExitQueueWithdrawTransactionDialogProps
    extends IDialogComponentProps<IGaugeVoterExitQueueWithdrawTransactionDialogParams> {}
