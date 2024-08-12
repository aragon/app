import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMember, IProposal, IVote } from './domain';
import type {
    IGetDelegatesListParams,
    IGetMemberListParams,
    IGetMemberParams,
    IGetProposalListParams,
    IGetProposalParams,
    IGetVoteListParams,
} from './governanceService.api';

class GovernanceService extends AragonBackendService {
    private urls = {
        delegates: '/delegates',
        members: '/members/active',
        member: '/members/active/:address',
        proposals: '/proposals',
        proposal: '/proposals/:id',
        votes: '/votes',
    };

    getDelegatesList = async <TDelegate extends IMember = IMember>(
        params: IGetMemberListParams,
    ): Promise<IPaginatedResponse<TDelegate>> => {
        const result = await this.request<IPaginatedResponse<TDelegate>>(this.urls.delegates, params);

        return result;
    }

    getMemberList = async <TMember extends IMember = IMember>(
        params: IGetMemberListParams,
    ): Promise<IPaginatedResponse<TMember>> => {
        const result = await this.request<IPaginatedResponse<TMember>>(this.urls.members, params);

        return result;
    };

    getMember = async <TMember extends IMember = IMember>(params: IGetMemberParams): Promise<TMember> => {
        const result = await this.request<TMember>(this.urls.member, params);

        return result;
    };

    getProposalList = async <TProposal extends IProposal = IProposal>(
        params: IGetProposalListParams,
    ): Promise<IPaginatedResponse<TProposal>> => {
        const result = await this.request<IPaginatedResponse<TProposal>>(this.urls.proposals, params);

        return result;
    };

    getProposal = async <TProposal extends IProposal = IProposal>(params: IGetProposalParams): Promise<TProposal> => {
        const result = await this.request<TProposal>(this.urls.proposal, params);

        return result;
    };

    getVoteList = async <TVote extends IVote = IVote>(
        params: IGetVoteListParams,
    ): Promise<IPaginatedResponse<TVote>> => {
        const result = await this.request<IPaginatedResponse<TVote>>(this.urls.votes, params);

        return result;
    };
}

export const governanceService = new GovernanceService();
