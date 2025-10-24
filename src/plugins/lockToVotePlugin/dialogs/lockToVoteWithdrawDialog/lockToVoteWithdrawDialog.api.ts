import type { IToken } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import type { ILockToVoteTicket } from '../../types';

export interface ILockToVoteWithdrawDialogParams {
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
    lockManagerAddress: string;
    /**
     * Ticket containing fee parameters and queue information.
     */
    ticket: ILockToVoteTicket;
    /**
     * Total locked amount (in wei).
     */
    lockedAmount: bigint;
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

export interface ILockToVoteWithdrawDialogProps extends IDialogComponentProps<ILockToVoteWithdrawDialogParams> {}
