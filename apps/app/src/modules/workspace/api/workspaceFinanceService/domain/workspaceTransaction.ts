import type { ITransaction } from '@/modules/finance/api/financeService';

export interface IWorkspaceTransaction {
    /**
     * The transaction as returned by the backend.
     */
    transaction: ITransaction;
    /**
     * ID of the DAO the transaction belongs to, used to attribute the transaction to a workspace account.
     */
    daoId: string;
    /**
     * Stable identity of the transaction, used to deduplicate the merged list. The backend only returns an `id` for
     * execution transactions, so this is derived from the block coordinates instead.
     */
    key: string;
}

export interface IWorkspaceTransactionAccountPage {
    /**
     * ID of the DAO this page was fetched for.
     */
    daoId: string;
    /**
     * Page number that was fetched (1-based indexing).
     */
    page: number;
    /**
     * Total number of pages available for this account.
     */
    totalPages: number;
    /**
     * Total number of transactions available for this account.
     */
    totalRecords: number;
    /**
     * Transactions returned for this page.
     */
    transactions: IWorkspaceTransaction[];
}

export interface IWorkspaceTransactionPage {
    /**
     * One entry per account fetched on this request. Only the accounts that needed to advance are fetched, so this
     * does not necessarily cover every account of the workspace.
     */
    accounts: IWorkspaceTransactionAccountPage[];
}
