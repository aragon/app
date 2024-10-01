import type { IDaoPlugin } from '@/shared/api/daoService';
import { generatePluginSettings } from './pluginSettings';

export const generateDaoPlugin = (daoPlugin?: Partial<IDaoPlugin>): IDaoPlugin => ({
    address: '0x123',
    type: 'unknown',
    subdomain: 'unknown',
    release: '0',
    build: '0',
    isProcess: false,
    isBody: false,
    isSubPlugin: false,
    settings: generatePluginSettings(),
    ...daoPlugin,
});
