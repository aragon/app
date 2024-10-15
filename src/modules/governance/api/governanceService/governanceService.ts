import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMember, IProposal, IVote } from './domain';
import type {
    IGetMemberListParams,
    IGetMemberOfParams,
    IGetMemberParams,
    IGetProposalListParams,
    IGetProposalParams,
    IGetVoteListParams,
} from './governanceService.api';

class GovernanceService extends AragonBackendService {
    private urls = {
        members: '/members',
        member: '/members/:address',
        memberOf: ' /members/:address/:pluginAddress/exists',
        proposals: '/proposals',
        proposal: '/proposals/:id',
        votes: '/votes',
    };

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

    getMemberOf = async <TMemberOf extends boolean = boolean>(params: IGetMemberOfParams): Promise<TMemberOf> => {
        const result = await this.request<TMemberOf>(this.urls.memberOf, params);

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
