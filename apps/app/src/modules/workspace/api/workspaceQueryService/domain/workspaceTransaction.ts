import type {
    ITransactionExecution,
    ITransactionTransfer,
} from '@/modules/finance/api/financeService';
import type { WorkspaceTransactionType } from './enum';
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
        IWorkspaceTransactionBase {}

export type IWorkspaceTransaction =
    | IWorkspaceTransactionTransfer
    | IWorkspaceTransactionExecution;
