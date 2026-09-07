import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IToken } from '../../domain';
import { financeService } from '../../financeService';
import type { IGetTokenInfoParams } from '../../financeService.api';
import { financeServiceKeys } from '../../financeServiceKeys';

export const tokenInfoOptions = (
    params: IGetTokenInfoParams,
    options?: QueryOptions<IToken>,
): SharedQueryOptions<IToken> => ({
    queryKey: financeServiceKeys.tokenInfo(params),
    queryFn: () => financeService.getTokenInfo(params),
    ...options,
});

export const useTokenInfo = (
    params: IGetTokenInfoParams,
    options?: QueryOptions<IToken>,
) => useQuery(tokenInfoOptions(params, options));
