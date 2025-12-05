import type { ISubDaoSummary } from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import { generateDaoMetrics } from './daoMetrics';

export const generateSubDao = (subDao?: Partial<ISubDaoSummary>): ISubDaoSummary => ({
    id: 'polygon-mainnet-0x123',
    address: '0x123',
    network: Network.POLYGON_MAINNET,
    name: 'SubDAO Test',
    description: 'Test SubDAO Description',
    ens: null,
    subdomain: null,
    avatar: null,
    metrics: generateDaoMetrics(),
    links: [],
    blockTimestamp: 1234567890,
    transactionHash: '0xabc',
    ...subDao,
});
