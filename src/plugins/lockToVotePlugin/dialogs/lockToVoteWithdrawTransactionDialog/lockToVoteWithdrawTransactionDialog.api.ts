import type { IToken } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService/domain/enum';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import type { Address } from 'viem';

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
    lockManagerAddress: Address;
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
    extends IDialogComponentProps<ILockToVoteWithdrawTransactionDialogParams> {}
