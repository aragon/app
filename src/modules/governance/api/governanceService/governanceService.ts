import {
    AragonBackendService,
    type IPaginatedResponse,
} from '@/shared/api/aragonBackendService';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
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
     * Networks whose token-voting member queries are served by the
     * aragon-subdomain BFF. Expand as more networks are indexed by Envio.
     */
    private static readonly SUBDOMAIN_NETWORKS: ReadonlySet<Network> = new Set([
        Network.ETHEREUM_MAINNET,
    ]);

    getMemberList = async <TMember extends IMember = IMember>(
        params: IGetMemberListParams,
    ): Promise<IPaginatedResponse<TMember>> => {
        const queryParams = params.queryParams;
        const pluginAddress = queryParams?.pluginAddress?.toLowerCase();
        const tokenAddress = queryParams?.tokenAddress?.toLowerCase();
        const network = queryParams?.network;
        const interfaceType = queryParams?.pluginInterfaceType;
        const tokenUnderlying = queryParams?.tokenUnderlying;

        // The subdomain Envio indexer only covers plain ERC-20 token-voting
        // governance tokens. Wrapped/VE-adapter tokens (where the governance
        // token wraps an underlying) are not indexed and must keep using the
        // legacy backend until Envio supports them.
        const useSubdomain =
            pluginAddress != null &&
            tokenAddress != null &&
            network != null &&
            GovernanceService.SUBDOMAIN_NETWORKS.has(network) &&
            interfaceType === PluginInterfaceType.TOKEN_VOTING &&
            tokenUnderlying == null;

        if (useSubdomain) {
            const query = new URLSearchParams({
                pluginAddress,
                tokenAddress,
                page: String(queryParams?.page ?? 1),
                pageSize: String(queryParams?.pageSize ?? 10),
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

        // Strip routing-only fields before forwarding to the legacy backend so
        // we don't introduce unknown query params that the backend may reject.
        const hasRoutingFields =
            queryParams != null &&
            (queryParams.network !== undefined ||
                queryParams.pluginInterfaceType !== undefined ||
                queryParams.tokenAddress !== undefined ||
                queryParams.tokenUnderlying !== undefined);

        let legacyParams = params;
        if (hasRoutingFields && queryParams != null) {
            const {
                network: _network,
                pluginInterfaceType: _pluginInterfaceType,
                tokenAddress: _tokenAddress,
                tokenUnderlying: _tokenUnderlying,
                ...rest
            } = queryParams;
            legacyParams = { ...params, queryParams: rest };
        }

        const result = await this.request<IPaginatedResponse<TMember>>(
            this.urls.members,
            legacyParams,
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
