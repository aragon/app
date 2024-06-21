import { generateTransaction, generateBalance } from './../../testUtils/';
import { generatePaginatedResponse, generatePaginatedResponseMetadata } from '@/shared/testUtils';
import { TransactionStatus, TransactionType } from '@/modules/finance/api/financeService/domain/transaction';

export const balanceListMock = generatePaginatedResponse({
    data: [
        generateBalance({
            logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
            name: 'Ethereum',
            symbol: 'ETH',
            address: '0x1',
            balance: '42729384',
        }),
        generateBalance({
            logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png',
            name: 'DAI',
            symbol: 'DAI',
            address: '0x2',
            balance: '2134',
        }),
        generateBalance({
            logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8119.png',
            name: 'SafePal',
            symbol: 'SFP',
            address: '0x3',
            balance: '0.14234',
        }),
    ],
    metadata: generatePaginatedResponseMetadata({ pageSize: 3, totalRecords: 3 }),
});

export const transactionListMock = generatePaginatedResponse({
    data: [
        generateTransaction({
            blockNumber: 439200932,
            category: 'category',
            daoAddress: '0xDaoAddress',
            fromAddress: '0xFrom',
            network: 'Ethereum-Sepolia',
            toAddress: 'vitalik.eth',
            token: { name: '', symbol: '', address: '', type: '', logo: ''},
            tokenAddress: '0xTokenMock1',
            type: 'deposit' as TransactionType,
            value: "100",
            transactionHash: '0xbeac185e86a59a2e17c3accdfe30aa5d6e89a7371b3c403247ce8dbb978eb1c3',
        }),
        generateTransaction({       
            transactionHash: '0xb6a0f66b12e3e34e5e4f606b4df0e2b1f6ac7c94c6e5b06b4e8b23b8ab6484b1',
        }),
        generateTransaction({
            transactionHash: '0xd1a1c5e3b1b5b6f4e1d7c5f6e1d5b5c5d1c5e3f1b5b1b5e1d5c5f1b5c1e3d1b6',
        }),
    ],
    metadata: generatePaginatedResponseMetadata({ pageSize: 3, totalRecords: 3 }),
});
