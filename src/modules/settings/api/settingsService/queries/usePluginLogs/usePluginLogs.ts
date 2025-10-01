import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import type { IPluginLogs } from '../../domain';
import { settingsService } from '../../settingsService';
import type { IGetPluginLogsParams } from '../../settingsService.api';
import { settingsServiceKeys } from '../../settingsServiceKeys';

export const pluginLogsOptions = (
    params: IGetPluginLogsParams,
    options?: QueryOptions<IPluginLogs>,
): SharedQueryOptions<IPluginLogs> => ({
    queryKey: settingsServiceKeys.pluginLogs(params),
    queryFn: () => settingsService.getPluginLogs(params),
    ...options,
});

export const usePluginLogs = (params: IGetPluginLogsParams, options?: QueryOptions<IPluginLogs>) => {
    return useQuery(pluginLogsOptions(params, options));
};