import { TransactionType } from '@/modules/finance/api/financeService/domain/enum';
import { type ITransaction } from '@/modules/finance/api/financeService/domain/transaction';
import { generateToken } from './token';
import { Network } from '@/shared/api/daoService/domain';

export const generateTransaction = (transaction?: Partial<ITransaction>): ITransaction => ({
    network: Network.ETHEREUM_MAINNET,
    blockNumber: 0,
    blockTimestamp: Date.now(),
    fromAddress: '0x0000000000000000000000000000000000000000',
    toAddress: '0x0000000000000000000000000000000000000000',
    token: generateToken(),
    value: '0',
    type: TransactionType.DEPOSIT,
    transactionHash: '0x0000000000000000000000000000000000000000',
    id: '0',
    amountUsd: '0',
    ...transaction,
});
