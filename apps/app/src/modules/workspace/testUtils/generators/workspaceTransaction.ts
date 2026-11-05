import { TransactionSide } from '@/modules/finance/api/financeService';
import {
    generateTransaction,
    type TransactionGeneratorExecution,
} from '@/modules/finance/testUtils';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceTransactionExecution,
    type IWorkspaceTransactionPendingExecution,
    type IWorkspaceTransactionTransfer,
    WorkspaceTransactionStatus,
    WorkspaceTransactionType,
} from '../../api/workspaceQueryService';

const workspaceFields = {
    account: {
        network: Network.ETHEREUM_MAINNET,
        address: '0x0000000000000000000000000000000000000000',
    },
    internal: false,
};

export function generateWorkspaceTransaction(
    transaction?: Partial<IWorkspaceTransactionTransfer>,
): IWorkspaceTransactionTransfer;
export function generateWorkspaceTransaction(
    transaction: Partial<IWorkspaceTransactionExecution> &
        TransactionGeneratorExecution,
): IWorkspaceTransactionExecution;
export function generateWorkspaceTransaction(
    transaction:
        | Partial<IWorkspaceTransactionTransfer>
        | (Partial<IWorkspaceTransactionExecution> &
              TransactionGeneratorExecution) = {},
): IWorkspaceTransactionTransfer | IWorkspaceTransactionExecution {
    if (transaction.side === TransactionSide.EXECUTION) {
        return {
            ...generateTransaction({ side: TransactionSide.EXECUTION }),
            ...workspaceFields,
            ...transaction,
        };
    }

    return {
        ...generateTransaction(),
        ...workspaceFields,
        type: WorkspaceTransactionType.ERC20,
        ...transaction,
    };
}

export const generateWorkspacePendingTransaction = (
    transaction?: Partial<IWorkspaceTransactionPendingExecution>,
): IWorkspaceTransactionPendingExecution => ({
    ...generateTransaction({ side: TransactionSide.EXECUTION }),
    ...workspaceFields,
    status: WorkspaceTransactionStatus.PENDING,
    transactionHash: null,
    blockNumber: null,
    blockTimestamp: null,
    submittedAt: 1_793_804_572,
    safeTxHash: '0x2632',
    nonce: '22',
    confirmations: 1,
    confirmationsRequired: 2,
    ...transaction,
});
