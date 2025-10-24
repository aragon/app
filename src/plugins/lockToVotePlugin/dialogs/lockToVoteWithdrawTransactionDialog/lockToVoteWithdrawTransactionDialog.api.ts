import type { Network } from '@/shared/api/daoService/domain/enum';
import type { IDialogProps } from '@/shared/components/dialogProvider';
import type { IToken } from '@/shared/types';
import type { Hex } from 'viem';

export interface ILockToVoteWithdrawTransactionDialogParams {
    /**
     * Token ID for the VotingEscrow NFT.
     */
    tokenId: bigint;
    /**
     * Token being withdrawn.
     */
    token: IToken;
    /**
     * Address of the DynamicExitQueue contract (lock manager).
     */
    lockManagerAddress: Hex;
    /**
     * Network to execute the transaction on.
     */
    network: Network;
    /**
     * Callback fired on successful withdrawal.
     */
    onSuccess?: () => void;
}

export interface ILockToVoteWithdrawTransactionDialogProps
    extends IDialogProps<ILockToVoteWithdrawTransactionDialogParams> {}
