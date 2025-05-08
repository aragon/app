import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMember, IProposal, IVote, IProposalAction, IProposalActions } from './domain';
import type {
    IGetCanVoteParams,
    IGetMemberExistsParams,
    IGetMemberListParams,
    IGetMemberParams,
    IGetProposalActionsParams,
    IGetProposalBySlugParams,
    IGetProposalListParams,
    IGetVoteListParams,
} from './governanceService.api';

class GovernanceService extends AragonBackendService {
    private urls = {
        members: '/members',
        member: '/members/:address',
        memberExists: '/members/:memberAddress/:pluginAddress/exists',
        proposals: '/proposals',
        proposalBySlug: '/proposals/slug/:slug',
        proposalActions: '/proposals/:id/actions',
        canVote: '/proposals/:id/can-vote',
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

    getMemberExists = async (params: IGetMemberExistsParams): Promise<boolean> => {
        const result = await this.request<boolean>(this.urls.memberExists, params);

        return result;
    };

    getProposalList = async <TProposal extends IProposal = IProposal>(
        params: IGetProposalListParams,
    ): Promise<IPaginatedResponse<TProposal>> => {
        const result = await this.request<IPaginatedResponse<TProposal>>(this.urls.proposals, params);

        return result;
    };

    getProposalBySlug = async <TProposal extends IProposal = IProposal>(
        params: IGetProposalBySlugParams,
    ): Promise<TProposal> => {
        const result = await this.request<TProposal>(this.urls.proposalBySlug, params);

        return result;
    };

        getProposalActions = async <TAction extends IProposalAction = IProposalAction>(
        params: IGetProposalActionsParams,
    ): Promise<IProposalActions<TAction>> => {
        const result = await this.request<IProposalActions<TAction>>(this.urls.proposalActions, params);

        return result;
    };

    getCanVote = async (params: IGetCanVoteParams): Promise<boolean> => {
        const result = await this.request<boolean>(this.urls.canVote, params);

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
