import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import type { IPluginInstallationData } from '../../domain';
import { settingsService } from '../../settingsService';
import type { IGetPluginInstallationDataParams } from '../../settingsService.api';
import { settingsServiceKeys } from '../../settingsServiceKeys';

export const pluginInstallationDataOptions = (
    params: IGetPluginInstallationDataParams,
    options?: QueryOptions<IPluginInstallationData>,
): SharedQueryOptions<IPluginInstallationData> => ({
    queryKey: settingsServiceKeys.pluginInstallationData(params),
    queryFn: () => settingsService.getPluginInstallationData(params),
    ...options,
});

export const usePluginInstallationData = (
    params: IGetPluginInstallationDataParams,
    options?: QueryOptions<IPluginInstallationData>,
) => {
    return useQuery(pluginInstallationDataOptions(params, options));
};
