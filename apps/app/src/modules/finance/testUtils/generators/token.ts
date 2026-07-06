import { Network } from '@/shared/api/daoService';
import type { IToken } from '../../api/financeService';

export const generateToken = (token?: Partial<IToken>): IToken => ({
    address: '0xTestAddress',
    network: Network.ETHEREUM_MAINNET,
    symbol: 'ETH',
    logo: 'https://test.com',
    name: 'Ethereum',
    decimals: 0,
    priceUsd: '0.00',
    totalSupply: '0',
    ...token,
});
