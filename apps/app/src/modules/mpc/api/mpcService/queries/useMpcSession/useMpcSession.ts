import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcSessionResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcSessionOptions = (
    options?: QueryOptions<IMpcSessionResponse>,
): SharedQueryOptions<IMpcSessionResponse> => ({
    queryKey: mpcServiceKeys.session(),
    queryFn: () => mpcService.getSession(),
    // Unauthenticated users get a 401, do not retry.
    retry: false,
    ...options,
});

export const useMpcSession = (options?: QueryOptions<IMpcSessionResponse>) =>
    useQuery(mpcSessionOptions(options));
