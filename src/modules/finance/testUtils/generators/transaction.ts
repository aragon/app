import { TransactionSide } from '@/modules/finance/api/financeService/domain/enum';
import { type ITransaction } from '@/modules/finance/api/financeService/domain/transaction';
import { Network } from '@/shared/api/daoService';
import { DateTime } from 'luxon';
import { generateToken } from './token';

export const generateTransaction = (transaction?: Partial<ITransaction>): ITransaction => ({
    network: Network.ETHEREUM_MAINNET,
    blockNumber: 0,
    blockTimestamp: DateTime.now().toMillis(),
    fromAddress: '0x0000000000000000000000000000000000000000',
    toAddress: '0x0000000000000000000000000000000000000000',
    token: generateToken(),
    value: '0',
    side: TransactionSide.DEPOSIT,
    transactionHash: '0x0000000000000000000000000000000000000000',
    id: '0',
    amountUsd: '0',
    ...transaction,
});
