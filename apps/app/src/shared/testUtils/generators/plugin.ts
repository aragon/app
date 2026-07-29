import type { IPlugin } from '@/shared/utils/pluginRegistryUtils';

export const generatePlugin = (plugin?: Partial<IPlugin>): IPlugin => ({
    id: 'plugin-id',
    name: 'Plugin Name',
    ...plugin,
});
