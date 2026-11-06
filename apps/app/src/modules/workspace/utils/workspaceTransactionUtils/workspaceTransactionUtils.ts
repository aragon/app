import { TransactionSide } from '@/modules/finance/api/financeService';
import {
    type IWorkspaceTransaction,
    type IWorkspaceTransactionExecution,
    type IWorkspaceTransactionPendingExecution,
    WorkspaceTransactionStatus,
} from '../../api/workspaceQueryService';

class WorkspaceTransactionUtils {
    /**
     * Narrows a transaction to an execution, executed or pending.
     */
    isExecution = (
        transaction: IWorkspaceTransaction,
    ): transaction is
        | IWorkspaceTransactionExecution
        | IWorkspaceTransactionPendingExecution =>
        transaction.side === TransactionSide.EXECUTION;

    /**
     * Narrows a transaction to a Safe transaction queued but not executed yet.
     */
    isPendingExecution = (
        transaction: IWorkspaceTransaction,
    ): transaction is IWorkspaceTransactionPendingExecution =>
        this.isExecution(transaction) &&
        'status' in transaction &&
        transaction.status === WorkspaceTransactionStatus.PENDING;

    /**
     * Timestamp (in seconds) of a transaction: the block it was included in, or its submission to the Safe
     * transaction service while it is pending.
     */
    getTimestamp = (transaction: IWorkspaceTransaction): number =>
        this.isPendingExecution(transaction)
            ? transaction.submittedAt
            : transaction.blockTimestamp;

    /**
     * Whether a pending transaction collected the confirmations it needs to be executed.
     */
    isExecutable = (
        transaction: IWorkspaceTransactionPendingExecution,
    ): boolean =>
        transaction.confirmations >= transaction.confirmationsRequired;

    /**
     * Title of a Safe transaction: the initials of its account followed by its nonce (e.g. `TS-43` for nonce 43 of
     * "Treasury Safe"), or the nonce alone when the account has no name.
     */
    getSafeTransactionTitle = (nonce: string, accountName?: string): string => {
        const initials = (accountName ?? '')
            .split(/\s+/)
            .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0] ?? '')
            .join('')
            .toUpperCase();

        return initials.length > 0 ? `${initials}-${nonce}` : `#${nonce}`;
    };
}

export const workspaceTransactionUtils = new WorkspaceTransactionUtils();
