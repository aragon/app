import { TransactionType } from '@/modules/finance/api/financeService/domain/enum';
import { type ITransaction } from '@/modules/finance/api/financeService/domain/transaction';
import { Network } from '@/shared/api/daoService';
import { generateAsset } from './asset';

export const generateTransaction = (transaction?: Partial<ITransaction>): ITransaction => ({
    network: Network.ETHEREUM_MAINNET,
    blockNumber: 0,
    blockTimestamp: Date.now(),
    fromAddress: '0x0000000000000000000000000000000000000000',
    toAddress: '0x0000000000000000000000000000000000000000',
    token: generateAsset(),
    value: '0',
    type: TransactionType.DEPOSIT,
    transactionHash: '0x0000000000000000000000000000000000000000',
    id: '0',
    ...transaction,
});
