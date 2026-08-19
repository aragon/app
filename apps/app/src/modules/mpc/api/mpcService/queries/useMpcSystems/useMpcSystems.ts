import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcSystemsResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcSystemsOptions = (
    options?: QueryOptions<IMpcSystemsResponse>,
): SharedQueryOptions<IMpcSystemsResponse> => ({
    queryKey: mpcServiceKeys.systems(),
    queryFn: () => mpcService.getSystems(),
    ...options,
});

export const useMpcSystems = (options?: QueryOptions<IMpcSystemsResponse>) =>
    useQuery(mpcSystemsOptions(options));
