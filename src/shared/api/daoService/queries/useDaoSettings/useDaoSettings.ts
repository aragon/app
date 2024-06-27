import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { daoService } from '../../daoService';
import type { IGetDaoSettingsParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';
import type { IDaoSettings } from '../../domain';

export const daoSettingsOptions = <TSettings extends IDaoSettings = IDaoSettings>(
    params: IGetDaoSettingsParams,
    options?: QueryOptions<TSettings>,
): SharedQueryOptions<TSettings> => ({
    queryKey: daoServiceKeys.daoSettings(params),
    queryFn: () => daoService.getDaoSettings(params),
    ...options,
});

export const useDaoSettings = <TSettings extends IDaoSettings = IDaoSettings>(
    params: IGetDaoSettingsParams,
    options?: QueryOptions<TSettings>,
) => {
    return useQuery(daoSettingsOptions(params, options));
};
