import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { governanceService } from '../../governanceService';
import type { IGetProposalCanVoteParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const proposalCanVoteOptions = (
    params: IGetProposalCanVoteParams,
    options?: QueryOptions<boolean>,
): SharedQueryOptions<boolean> => ({
    queryKey: governanceServiceKeys.proposalCanVote(params),
    queryFn: () => governanceService.getProposalCanVote(params),
    ...options,
});

export const useProposalCanVote = (params: IGetProposalCanVoteParams, options?: QueryOptions<boolean>) => {
    return useQuery(proposalCanVoteOptions(params, options));
};
