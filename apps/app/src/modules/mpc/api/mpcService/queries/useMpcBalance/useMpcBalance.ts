import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcBalanceResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcGetBalanceServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const mpcBalanceOptions = (
    params: IMpcGetBalanceServiceParams,
    options?: QueryOptions<IMpcBalanceResponse>,
): SharedQueryOptions<IMpcBalanceResponse> => ({
    queryKey: mpcServiceKeys.balance(params),
    queryFn: () => mpcService.getBalance(params),
    ...options,
});

export const useMpcBalance = (
    params: IMpcGetBalanceServiceParams,
    options?: QueryOptions<IMpcBalanceResponse>,
) => useQuery(mpcBalanceOptions(params, options));
