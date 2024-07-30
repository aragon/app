import type { IDaoPlugin } from '@/shared/api/daoService';

export const generateDaoPlugin = (daoPlugin?: Partial<IDaoPlugin>): IDaoPlugin => ({
    address: '0x123',
    type: 'unknown',
    subdomain: 'unknown',
    transactionHash: '0x0000000000000000000000000000000000000000',
    blockNumber: 0,
    implementationAddress: '0x0000000000000000000000000000000000000000',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    pluginSetupRepoAddress: '0x0000000000000000000000000000000000000000',
    release: '0',
    build: '1',
    ...daoPlugin,
});
