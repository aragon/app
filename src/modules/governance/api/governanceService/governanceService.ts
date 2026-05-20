import { invariant } from '@aragon/gov-ui-kit';
import { lockToVoteProposalUtils } from '@/plugins/lockToVotePlugin/utils/lockToVoteProposalUtils';
import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
import {
    AragonBackendService,
    type IPaginatedResponse,
} from '@/shared/api/aragonBackendService';
import type {
    ICanCreateProposalResult,
    IMemberExistsResult,
} from '../../types';
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
import { collectTokenAddresses } from './utils/collectTokenAddresses';
import { fetchTokensTotalSupply } from './utils/fetchTokensTotalSupply';

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

        const addresses = Array.from(
            new Set(result.data.flatMap(collectTokenAddresses)),
        );

        invariant(
            result.data.every((p) => p.network === result.data[0]?.network),
            'GovernanceService.getProposalList: all proposals must share the same network',
        );

        const tokensTotalSupply =
            addresses.length === 0 || result.data.length === 0
                ? {}
                : await fetchTokensTotalSupply(
                      result.data[0].network,
                      addresses,
                  );

        return {
            ...result,
            data: result.data.map((proposal) =>
                this.attachTotalSupply(proposal, tokensTotalSupply),
            ),
        };
    };

    getProposalBySlug = async <TProposal extends IProposal = IProposal>(
        params: IGetProposalBySlugParams,
    ): Promise<TProposal> => {
        const proposal = await this.request<TProposal>(
            this.urls.proposalBySlug,
            params,
        );

        const addresses = collectTokenAddresses(proposal);
        const tokensTotalSupply =
            addresses.length === 0
                ? {}
                : await fetchTokensTotalSupply(proposal.network, addresses);

        return this.attachTotalSupply(proposal, tokensTotalSupply);
    };

    private attachTotalSupply = <TProposal extends IProposal>(
        proposal: TProposal,
        tokensTotalSupply: Record<string, string>,
    ): TProposal => {
        if (lockToVoteProposalUtils.isLockToVoteProposal(proposal)) {
            return { ...proposal, tokensTotalSupply };
        }

        if (sppProposalUtils.isSppProposal(proposal)) {
            return {
                ...proposal,
                subProposals: proposal.subProposals.map((sub) =>
                    lockToVoteProposalUtils.isLockToVoteProposal(sub)
                        ? { ...sub, tokensTotalSupply }
                        : sub,
                ),
            };
        }

        return proposal;
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
