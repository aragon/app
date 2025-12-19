import type { Address } from 'viem';
import type { IToken } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import type { ITokenExitQueueTicket } from '../../types';

export interface ITokenExitQueueWithdrawDialogParams {
    /**
     * Token ID for the NFT lock.
     */
    tokenId: bigint;
    /**
     * Token information for display.
     */
    token: IToken;
    /**
     * Address of the lock manager contract (DynamicExitQueue).
     */
    lockManagerAddress: Address;
    /**
     * Address of the VotingEscrow contract where withdraw is called.
     */
    escrowAddress: Address;
    /**
     * Ticket containing fee parameters and queue information.
     */
    ticket: ITokenExitQueueTicket;
    /**
     * Total locked amount (in wei).
     */
    lockedAmount: bigint;
    /**
     * Pre-calculated fee amount (in wei). Optional - dialog will calculate if not provided.
     */
    feeAmount?: bigint;
    /**
     * Network used for the transaction.
     */
    network: Network;
    /**
     * Callback called when Back button is clicked to return to locks list.
     */
    onBack?: () => void;
    /**
     * Callback called on successful withdrawal.
     */
    onSuccess?: () => void;
}

export interface ITokenExitQueueWithdrawDialogProps
    extends IDialogComponentProps<ITokenExitQueueWithdrawDialogParams> {}
