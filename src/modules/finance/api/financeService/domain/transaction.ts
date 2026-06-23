import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { Network } from '@/shared/api/daoService';
import type { TransactionSide } from './enum';
import type { IToken } from './token';

export type TransactionTransferSide = Exclude<
    TransactionSide,
    TransactionSide.EXECUTION
>;

export interface ITransactionBase {
    /**
     * The network identifier for the transaction.
     */
    network: Network;
    /**
     * The block number in which the transaction is included.
     */
    blockNumber: number;
    /**
     * The timestamp of the block in which the transaction is included.
     */
    blockTimestamp: number;
    /**
     * The address from which the transaction originates.
     */
    fromAddress: string;
    /**
     * The address to which the transaction is sent.
     */
    toAddress: string;
    /**
     * The value of the transaction.
     */
    value: string;
    /**
     * The hash of the transaction.
     */
    transactionHash: `0x${string}`;
    /**
     * The id of the transaction.
     */
    id: string;
}

export interface ITransactionTransfer extends ITransactionBase {
    /**
     * The side of the transaction (deposit or withdrawal).
     */
    side: TransactionTransferSide;
    /**
     * The token involved in the transaction.
     */
    token: IToken;
    /**
     * The amount of the transaction in USD.
     */
    amountUsd: string;
}

export interface ITransactionExecution extends ITransactionBase {
    /**
     * Execution transaction side.
     */
    side: TransactionSide.EXECUTION;
    /**
     * Execution transaction type returned by the backend.
     */
    type: 'execution';
    /**
     * DAO that emitted the execution.
     */
    daoAddress?: string;
    /**
     * Source that initiated the execution, e.g. plugin slug/interface or executor address.
     */
    source?: string;
    /**
     * Proposal index when the execution comes from a proposal-backed plugin.
     */
    proposalIndex?: string | null;
    /**
     * Number of actions bundled in the execution.
     */
    actionCount: number;
}

export type ITransaction = ITransactionTransfer | ITransactionExecution;

export interface ITransactionActionsResult<
    TAction extends IProposalAction = IProposalAction,
> {
    /**
     * Source that initiated the execution, e.g. plugin slug/interface or executor address.
     */
    source?: string;
    /**
     * Number of actions bundled in the execution.
     */
    actionCount: number;
    /**
     * Address or entity that executed the transaction.
     */
    executedBy?: string;
    /**
     * Hash of the execution transaction.
     */
    transactionHash: `0x${string}`;
    /**
     * Timestamp of the block in which the execution was included.
     */
    blockTimestamp: number;
    /**
     * Proposal slug that triggered the execution when available.
     */
    proposalSlug?: string;
    /**
     * Flag indicating if the actions are still being decoded.
     */
    decoding: boolean;
    /**
     * The decoded actions.
     */
    actions: TAction[];
    /**
     * The raw actions.
     */
    rawActions?: Pick<IProposalAction, 'to' | 'value' | 'data'>[];
}
