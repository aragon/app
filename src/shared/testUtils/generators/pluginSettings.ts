import type { IPluginSettings } from '@/shared/api/daoService';

export const generatePluginSettings = (settings?: Partial<IPluginSettings>): IPluginSettings => ({
    ...settings,
});
