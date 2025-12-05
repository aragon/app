import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { daoService } from '../../daoService';
import type { IGetDaoPoliciesParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';
import type { IDaoPolicy } from '../../domain';

export const daoPoliciesOptions = (
    params: IGetDaoPoliciesParams,
    options?: QueryOptions<IDaoPolicy[]>,
): SharedQueryOptions<IDaoPolicy[]> => ({
    queryKey: daoServiceKeys.daoPolicies(params),
    queryFn: () => daoService.getDaoPolicies(params),
    ...options,
});

export const useDaoPolicies = (params: IGetDaoPoliciesParams, options?: QueryOptions<IDaoPolicy[]>) => {
    return useQuery(daoPoliciesOptions(params, options));
};
