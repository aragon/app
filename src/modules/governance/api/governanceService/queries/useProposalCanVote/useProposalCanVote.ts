import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import type { IProposal } from '../../domain';
import { governanceService } from '../../governanceService';
import type { IGetProposalCanVoteParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const proposalCanVoteOptions = <TProposal extends IProposal = IProposal>(
    params: IGetProposalCanVoteParams,
    options?: QueryOptions<TProposal>,
): SharedQueryOptions<TProposal> => ({
    queryKey: governanceServiceKeys.proposalCanVote(params),
    queryFn: () => governanceService.getProposal(params),
    ...options,
});

export const useProposalCanVote = <TProposal extends IProposal = IProposal>(
    params: IGetProposalCanVoteParams,
    options?: QueryOptions<TProposal>,
) => {
    return useQuery(proposalCanVoteOptions(params, options));
};
