import type { IGetPluginsByDaoParams } from './pluginsService.api';

export const pluginsServiceKeys = {
    allPlugins: ['plugins'] as const,
    pluginsByDao: (params: IGetPluginsByDaoParams) => [...pluginsServiceKeys.allPlugins, 'pluginsByDao', params.urlParams] as const,
};
