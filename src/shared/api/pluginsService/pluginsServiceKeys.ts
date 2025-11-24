import type { IGetDaoPluginsByDaoParams } from './pluginsService.api';

export const pluginsServiceKeys = {
    all: ['plugins'] as const,
    daoPluginsByDao: (params: IGetDaoPluginsByDaoParams) =>
        [...pluginsServiceKeys.all, 'daoPluginsByDao', params.urlParams] as const,
};
