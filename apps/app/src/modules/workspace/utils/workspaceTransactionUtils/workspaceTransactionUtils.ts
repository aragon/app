import { TransactionSide } from '@/modules/finance/api/financeService';
import {
    type IWorkspaceTransaction,
    type IWorkspaceTransactionExecution,
    type IWorkspaceTransactionPendingExecution,
    WorkspaceTransactionStatus,
} from '../../api/workspaceQueryService';
import { workspaceUtils } from '../workspaceUtils';

/**
 * URL parameter of the workspace transactions page naming, by its hash, the Safe transaction to expand on arrival.
 */
export const workspaceSafeTransactionParam = 'safetx';

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
     * Whether a pending transaction collected the confirmations it needs to be executed, as counted by the backend.
     * Unlike `safeTransactionUtils.getApprovalReadiness`, it neither drops confirmations of removed owners nor
     * checks the nonce, so a row can be tagged executable while its voting card cannot execute it yet.
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

    /**
     * URL of a Safe transaction inside a workspace: the transactions of its account, which expand the transaction
     * named by `workspaceSafeTransactionParam`.
     * @param workspaceId - ID of the workspace.
     * @param accountId - ID of the Safe account the transaction belongs to.
     * @param safeTxHash - Hash of the Safe transaction.
     * @returns The URL of the transaction.
     */
    getSafeTransactionUrl = (
        workspaceId: string,
        accountId: string,
        safeTxHash: string,
    ): string => {
        const transactionsUrl = workspaceUtils.getAccountScopeUrl(
            workspaceId,
            accountId,
            'transactions',
        );
        const searchParams = new URLSearchParams({
            [workspaceSafeTransactionParam]: safeTxHash,
        });

        return `${transactionsUrl}?${searchParams.toString()}`;
    };
}

export const workspaceTransactionUtils = new WorkspaceTransactionUtils();
