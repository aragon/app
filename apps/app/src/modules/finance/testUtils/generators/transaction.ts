import { DateTime } from 'luxon';
import { TransactionSide } from '@/modules/finance/api/financeService/domain/enum';
import type {
    ITransactionExecution,
    ITransactionTransfer,
} from '@/modules/finance/api/financeService/domain/transaction';
import { Network } from '@/shared/api/daoService';
import { generateToken } from './token';

const transactionBase = {
    network: Network.ETHEREUM_MAINNET,
    blockNumber: 0,
    blockTimestamp: DateTime.now().toMillis(),
    fromAddress: '0x0000000000000000000000000000000000000000',
    toAddress: '0x0000000000000000000000000000000000000000',
    value: '0',
    transactionHash: '0x0000000000000000000000000000000000000000' as const,
    id: '0',
};

export type TransactionGeneratorExecution = Partial<ITransactionExecution> & {
    side: TransactionSide.EXECUTION;
};

export function generateTransaction(
    transaction?: Partial<ITransactionTransfer>,
): ITransactionTransfer;
export function generateTransaction(
    transaction: TransactionGeneratorExecution,
): ITransactionExecution;
export function generateTransaction(
    transaction:
        | Partial<ITransactionTransfer>
        | TransactionGeneratorExecution = {},
): ITransactionTransfer | ITransactionExecution {
    if (transaction.side === TransactionSide.EXECUTION) {
        return {
            ...transactionBase,
            source: 'router',
            actionCount: 1,
            ...transaction,
            side: TransactionSide.EXECUTION,
            type: 'execution',
        };
    }

    return {
        ...transactionBase,
        token: generateToken(),
        side: TransactionSide.DEPOSIT,
        amountUsd: '0',
        ...transaction,
    };
}
