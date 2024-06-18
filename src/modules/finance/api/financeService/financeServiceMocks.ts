import { generatePaginatedResponse, generatePaginatedResponseMetadata } from '@/shared/testUtils';
import { generateBalance } from '../../testUtils';

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
