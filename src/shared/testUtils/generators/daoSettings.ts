import type { IDaoSettings } from '@/shared/api/daoService';

export const generateDaoSettings = (settings?: Partial<IDaoSettings>): IDaoSettings => ({
    id: 'settings-id',
    pluginAddress: '0xd77593aEAf0C88123708367a2c8F56B0bdABEE18',
    pluginSubdomain: 'unknown',
    settings: {},
    ...settings,
});
