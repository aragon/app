import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { ICanCreateProposalResult, IMemberExistsResult } from './../../types';
import type { IMember, IProposal, IProposalAction, IProposalActionsResult, IVote } from './domain';
import type {
    IGetCanCreateProposalParams,
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
        members: '/v2/members',
        member: '/v2/members/:address',
        memberExists: '/v2/members/:memberAddress/:pluginAddress/exists',
        proposals: '/v2/proposals',
        proposalBySlug: '/v2/proposals/slug/:slug',
        proposalActions: '/v2/proposals/:id/actions',
        canCreateProposal: '/v2/proposals/can-create-proposal',
        votes: '/v2/votes',
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

    getMemberExists = async (params: IGetMemberExistsParams): Promise<IMemberExistsResult> => {
        const result = await this.request<IMemberExistsResult>(this.urls.memberExists, params);

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
    ): Promise<IProposalActionsResult<TAction>> => {
        const result = await this.request<IProposalActionsResult<TAction>>(this.urls.proposalActions, params);

        return result;
    };

    getCanCreateProposal = async (params: IGetCanCreateProposalParams): Promise<ICanCreateProposalResult> => {
        const result = await this.request<ICanCreateProposalResult>(this.urls.canCreateProposal, params);

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
