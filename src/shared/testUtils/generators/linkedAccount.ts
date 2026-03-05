import type { ILinkedAccountSummary } from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import { generateDaoMetrics } from './daoMetrics';

export const generateLinkedAccount = (
    linkedAccount?: Partial<ILinkedAccountSummary>,
): ILinkedAccountSummary => ({
    id: 'polygon-mainnet-0x123',
    address: '0x123',
    network: Network.POLYGON_MAINNET,
    name: 'LinkedAccount Test',
    description: 'Test LinkedAccount Description',
    ens: null,
    subdomain: null,
    avatar: null,
    metrics: generateDaoMetrics(),
    links: [],
    blockTimestamp: 1_234_567_890,
    transactionHash: '0xabc',
    ...linkedAccount,
});
