import type { IDaoPlugin } from '@/shared/api/daoService';

export const generateDaoPlugin = (daoPlugin?: Partial<IDaoPlugin>): IDaoPlugin => ({
    address: '0x123',
    type: 'unknown',
    subdomain: 'unknown',
    release: '0',
    build: '1',
    ...daoPlugin,
});
