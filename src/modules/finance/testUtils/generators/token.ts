import type { IToken } from '../../api/financeService';

export const generateToken = (token?: Partial<IToken>): IToken => ({
    address: '0xTestAddress',
    network: 'ethereum-mainnet',
    symbol: 'ETH',
    logo: 'https://test.com',
    name: 'Ethereum',
    type: 'ERC-20',
    decimals: 0,
    priceChangeOnDayUsd: '0.00',
    priceUsd: '0.00',
    ...token,
});
