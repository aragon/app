import { TransactionType } from '@/modules/finance/api/financeService/domain/enum';
import { type ITransaction } from '@/modules/finance/api/financeService/domain/transaction';
import { Network } from '@/shared/api/daoService';

export const generateTransaction = (transaction?: Partial<ITransaction>): ITransaction => ({
  network: Network.ETHEREUM_MAINNET,
  blockNumber: 0, 
  blockTimestamp: Date.now(),
  fromAddress: '0x0000000000000000000000000000000000000000', 
  toAddress: '0x0000000000000000000000000000000000000000', 
  token: {
    address: '0xec10f0f223e52f2d939c7372b62ef2f55173282f',
    network: 'ethereum-mainnet',
    symbol: 'ETH',
    logo: 'https://test.com',
    name: 'Ethereum',
    type: '',
    decimals: 0,
    priceChangeOnDayUsd: '0.00',
    priceUsd: '0.00',
  }, 
  value: '0', 
  type: TransactionType.DEPOSIT, 
  transactionHash: '0x0000000000000000000000000000000000000000',
  id: '0', 
  category: 'external', 
  tokenAddress: '0x0000000000000000000000000000000000000000',
  daoAddress: '0x0000000000000000000000000000000000000000',
  ...transaction,
});