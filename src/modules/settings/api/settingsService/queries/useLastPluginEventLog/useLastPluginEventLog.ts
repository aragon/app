import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IPluginEventLog } from '../../domain';
import { settingsService } from '../../settingsService';
import type { IGetLastPluginEventLogParams } from '../../settingsService.api';
import { settingsServiceKeys } from '../../settingsServiceKeys';

export const lastPluginEventLogOptions = (
    params: IGetLastPluginEventLogParams,
    options?: QueryOptions<IPluginEventLog>
): SharedQueryOptions<IPluginEventLog> => ({
    queryKey: settingsServiceKeys.lastPluginEventLog(params),
    queryFn: () => settingsService.getLastPluginEventLog(params),
    ...options,
});

export const useLastPluginEventLog = (params: IGetLastPluginEventLogParams, options?: QueryOptions<IPluginEventLog>) =>
    useQuery(lastPluginEventLogOptions(params, options));
