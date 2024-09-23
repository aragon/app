import { Network, type IDao } from '@/shared/api/daoService';
import { generateDaoMetrics } from './daoMetrics';

export const generateDao = (dao?: Partial<IDao>): IDao => ({
    id: 'dao-test',
    address: '1234',
    network: Network.ETHEREUM_MAINNET,
    name: 'name',
    description: 'description',
    version: '1.3.0',
    subdomain: null,
    avatar: null,
    plugins: [],
    isSupported: true,
    metrics: generateDaoMetrics(),
    links: [],
    blockTimestamp: 0,
    transactionHash: '',
    ...dao,
});
