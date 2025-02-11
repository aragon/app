import type { IPlugin } from '@/shared/utils/pluginRegistryUtils';

export const generatePlugin = (plugin?: Partial<IPlugin>): IPlugin => ({
    id: 'plugin-id',
    name: 'Plugin Name',
    installVersion: { build: 1, release: 1 },
    repositoryAddresses: {} as IPlugin['repositoryAddresses'],
    ...plugin,
});
