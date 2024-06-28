import { Network, type IDao } from '@/shared/api/daoService';
import { generateDaoMetrics } from './daoMetrics';

export const generateDao = (dao?: Partial<IDao>): IDao => ({
    id: 'dao-test',
    address: '1234',
    network: Network.ETHEREUM_MAINNET,
    name: 'name',
    description: 'description',
    ens: null,
    avatar: null,
    plugins: [],
    isSupported: true,
    tvlUSD: '0',
    metrics: generateDaoMetrics(),
    links: [],
    blockTimestamp: +new Date(),
    ...dao,
});
