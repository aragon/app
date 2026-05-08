import {
    AragonBackendService,
    type IPaginatedResponse,
} from '@/shared/api/aragonBackendService';
import type {
    ICanCreateProposalResult,
    IMemberExistsResult,
} from './../../types';
import type {
    IMember,
    IProposal,
    IProposalAction,
    IProposalActionsResult,
    IVote,
} from './domain';
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

    /**
     * Demo routing: for select plugins, fetch members through the
     * aragon-subdomain BFF instead of the legacy backend.
     * Remove once the subdomain covers all governance types.
     */
    private static readonly SUBDOMAIN_TOKEN_BY_PLUGIN: Record<string, string> =
        {
            '0x9b7b2dea1eeb65a10d8b8df5113d99cd58c3f9cf':
                '0x0a830e9f2baa2ebaf8d33c0806283dea9c08952f',
        };

    getMemberList = async <TMember extends IMember = IMember>(
        params: IGetMemberListParams,
    ): Promise<IPaginatedResponse<TMember>> => {
        const pluginAddress = params.queryParams?.pluginAddress?.toLowerCase();
        const tokenAddress =
            pluginAddress != null
                ? GovernanceService.SUBDOMAIN_TOKEN_BY_PLUGIN[pluginAddress]
                : undefined;

        if (tokenAddress && pluginAddress) {
            const query = new URLSearchParams({
                pluginAddress,
                tokenAddress,
                page: String(params.queryParams?.page ?? 1),
                pageSize: String(params.queryParams?.pageSize ?? 10),
            });
            const response = await fetch(
                `/api/subdomain/members?${query.toString()}`,
            );
            if (!response.ok) {
                throw new Error(
                    `Subdomain members request failed: ${response.status}`,
                );
            }
            return (await response.json()) as IPaginatedResponse<TMember>;
        }

        const result = await this.request<IPaginatedResponse<TMember>>(
            this.urls.members,
            params,
        );

        return result;
    };

    getMember = async <TMember extends IMember = IMember>(
        params: IGetMemberParams,
    ): Promise<TMember> => {
        const result = await this.request<TMember>(this.urls.member, params);

        return result;
    };

    getMemberExists = async (
        params: IGetMemberExistsParams,
    ): Promise<IMemberExistsResult> => {
        const result = await this.request<IMemberExistsResult>(
            this.urls.memberExists,
            params,
        );

        return result;
    };

    getProposalList = async <TProposal extends IProposal = IProposal>(
        params: IGetProposalListParams,
    ): Promise<IPaginatedResponse<TProposal>> => {
        const result = await this.request<IPaginatedResponse<TProposal>>(
            this.urls.proposals,
            params,
        );

        return result;
    };

    getProposalBySlug = async <TProposal extends IProposal = IProposal>(
        params: IGetProposalBySlugParams,
    ): Promise<TProposal> => {
        const result = await this.request<TProposal>(
            this.urls.proposalBySlug,
            params,
        );

        return result;
    };

    getProposalActions = async <
        TAction extends IProposalAction = IProposalAction,
    >(
        params: IGetProposalActionsParams,
    ): Promise<IProposalActionsResult<TAction>> => {
        const result = await this.request<IProposalActionsResult<TAction>>(
            this.urls.proposalActions,
            params,
        );

        return result;
    };

    getCanCreateProposal = async (
        params: IGetCanCreateProposalParams,
    ): Promise<ICanCreateProposalResult> => {
        const result = await this.request<ICanCreateProposalResult>(
            this.urls.canCreateProposal,
            params,
        );

        return result;
    };

    getVoteList = async <TVote extends IVote = IVote>(
        params: IGetVoteListParams,
    ): Promise<IPaginatedResponse<TVote>> => {
        const result = await this.request<IPaginatedResponse<TVote>>(
            this.urls.votes,
            params,
        );

        return result;
    };
}

export const governanceService = new GovernanceService();
