import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { governanceService } from '../../governanceService';
import type { IGetCanVoteParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const canVoteOptions = (
    params: IGetCanVoteParams,
    options?: QueryOptions<boolean>,
): SharedQueryOptions<boolean> => ({
    queryKey: governanceServiceKeys.canVote(params),
    queryFn: () => governanceService.getCanVote(params),
    ...options,
});

export const useCanVote = (params: IGetCanVoteParams, options?: QueryOptions<boolean>) => {
    return useQuery(canVoteOptions(params, options));
};
