import { TransactionSide } from '@/modules/finance/api/financeService';
import {
    generateTransaction,
    type TransactionGeneratorExecution,
} from '@/modules/finance/testUtils';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceTransactionExecution,
    type IWorkspaceTransactionTransfer,
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
