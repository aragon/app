import type {
    ITransactionExecution,
    ITransactionTransfer,
} from '@/modules/finance/api/financeService';
import type {
    WorkspaceTransactionStatus,
    WorkspaceTransactionType,
} from './enum';
import type { IWorkspaceAccountRef } from './workspaceAccountInfo';

export type WorkspaceTransactionTransferType = Exclude<
    WorkspaceTransactionType,
    WorkspaceTransactionType.EXECUTION
>;

/**
 * Fields the workspace transactions endpoint adds to the rows returned by the DAO transactions endpoint.
 */
export interface IWorkspaceTransactionBase {
    /**
     * Selected account the row belongs to. A transfer between two selected accounts is returned once per account,
     * so this is the only way to tell which side of it a row represents.
     */
    account: IWorkspaceAccountRef;
    /**
     * Whether both the sender and the receiver are selected accounts on the same network. Such a transfer is
     * returned twice, once per account, and both rows are flagged.
     */
    internal: boolean;
    /**
     * Address of the DAO the row belongs to.
     */
    daoAddress?: string;
}

export interface IWorkspaceTransactionTransfer
    extends ITransactionTransfer,
        IWorkspaceTransactionBase {
    /**
     * Kind of transfer.
     */
    type: WorkspaceTransactionTransferType;
}

export interface IWorkspaceTransactionExecution
    extends ITransactionExecution,
        IWorkspaceTransactionBase {
    /**
     * Hash of the Safe transaction behind the execution, set on the executions of Safe accounts.
     */
    safeTxHash?: string;
    /**
     * Nonce of the Safe transaction behind the execution, set on the executions of Safe accounts.
     */
    nonce?: string;
}

/**
 * Safe transaction queued on the Safe transaction service but not executed yet. It has no onchain trace (hash,
 * block), and the endpoint always returns these rows before the executed ones.
 */
export interface IWorkspaceTransactionPendingExecution
    extends Omit<
        IWorkspaceTransactionExecution,
        | 'transactionHash'
        | 'blockNumber'
        | 'blockTimestamp'
        | 'safeTxHash'
        | 'nonce'
    > {
    /**
     * Status of the transaction.
     */
    status: WorkspaceTransactionStatus.PENDING;
    /**
     * Not executed yet, so not included in any transaction.
     */
    transactionHash: null;
    /**
     * Not executed yet, so not included in any block.
     */
    blockNumber: null;
    /**
     * Not executed yet, so not included in any block.
     */
    blockTimestamp: null;
    /**
     * Timestamp (in seconds) at which the transaction was submitted to the Safe transaction service.
     */
    submittedAt: number;
    /**
     * Hash of the Safe transaction.
     */
    safeTxHash: string;
    /**
     * Nonce of the Safe transaction.
     */
    nonce: string;
    /**
     * Number of owner confirmations collected so far.
     */
    confirmations: number;
    /**
     * Number of owner confirmations required to execute the transaction, as reported by the Safe transaction
     * service.
     */
    confirmationsRequired: number;
}

export type IWorkspaceTransaction =
    | IWorkspaceTransactionTransfer
    | IWorkspaceTransactionExecution
    | IWorkspaceTransactionPendingExecution;
