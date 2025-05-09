import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import { DateTime } from 'luxon';
import { generatePluginSettings } from './pluginSettings';

export const generateDaoPlugin = <TSettings extends IPluginSettings = IPluginSettings>(
    daoPlugin?: Partial<IDaoPlugin<TSettings>>,
): IDaoPlugin<TSettings> => ({
    address: '0x123',
    subdomain: 'unknown',
    release: '0',
    build: '0',
    isProcess: false,
    isBody: false,
    isSubPlugin: false,
    settings: generatePluginSettings() as TSettings,
    blockTimestamp: DateTime.now().toMillis(),
    transactionHash: '0x123',
    slug: 'slug',
    preparedSetupData: { helpers: [] },
    ...daoPlugin,
});
