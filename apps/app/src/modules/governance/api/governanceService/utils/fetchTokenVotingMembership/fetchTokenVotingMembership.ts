import type { PageDTO, TokenVotingMemberDTO } from '@aragon/aragon-domain';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { IGetTokenVotingMembersParams } from '../../../tokenVotingMembershipService';
import type {
    IGetMemberListParams,
    IGetTokenVotingMembershipParams,
    IGetTokenVotingMembershipQueryParams,
} from '../../governanceService.api';
import { mapBackendMemberToTokenVotingDTO } from '../mapBackendMemberToTokenVotingDTO';

export type FetchDomainTokenVotingMembers = (
    params: IGetTokenVotingMembersParams,
) => Promise<PageDTO<TokenVotingMemberDTO>>;

export type FetchLegacyMemberList = (
    params: IGetMemberListParams,
) => Promise<IPaginatedResponse<ITokenMember>>;

/**
 * Networks whose token-voting member queries are served by the
 * aragon-domain BFF. Expand as more networks are indexed by aragon-indexer.
 */
const DOMAIN_NETWORKS: ReadonlySet<Network> = new Set([
    Network.ETHEREUM_MAINNET,
]);

/**
 * Decides which backing source serves a token-voting member query.
 *
 * The aragon-domain only covers plain ERC-20 token-voting governance
 * tokens on the networks in `DOMAIN_NETWORKS`, and only while the domain
 * source is enabled (feature flag). Wrapped and voting-escrow tokens, and
 * every other plugin type or network, continue to use the legacy backend
 * until the aragon-domain supports them.
 */
const resolveMemberSource = (
    queryParams: IGetTokenVotingMembershipQueryParams,
): 'domain' | 'backend' => {
    const {
        pluginAddress,
        tokenAddress,
        network,
        pluginInterfaceType,
        tokenUnderlying,
        hasVotingEscrow,
        domainSourceEnabled,
    } = queryParams;

    const useDomain =
        domainSourceEnabled === true &&
        pluginAddress != null &&
        tokenAddress != null &&
        network != null &&
        DOMAIN_NETWORKS.has(network) &&
        pluginInterfaceType === PluginInterfaceType.TOKEN_VOTING &&
        tokenUnderlying == null &&
        hasVotingEscrow !== true;

    return useDomain ? 'domain' : 'backend';
};

/**
 * Routes token-voting membership queries.
 *
 * The domain branch falls back to the legacy backend when the domain call
 * fails, so the UI never depends on the domain source being available: the
 * failure is reported and the page is served from the legacy backend.
 *
 * The legacy branch strips the routing-only fields before forwarding so no
 * unknown query params reach the backend, then normalizes the response
 * through the anti-corruption mapper. Both branches return the library-owned
 * `TokenVotingMemberDTO` page.
 */
export const fetchTokenVotingMembership = async (
    params: IGetTokenVotingMembershipParams,
    fetchDomainMembers: FetchDomainTokenVotingMembers,
    fetchLegacyMemberList: FetchLegacyMemberList,
): Promise<PageDTO<TokenVotingMemberDTO>> => {
    const { queryParams } = params;
    const { tokenAddress, network, page, pageSize } = queryParams;

    if (
        tokenAddress != null &&
        network != null &&
        resolveMemberSource(queryParams) === 'domain'
    ) {
        try {
            return await fetchDomainMembers({
                queryParams: {
                    chainId: networkDefinitions[network].id,
                    pluginAddress: queryParams.pluginAddress.toLowerCase(),
                    tokenContractAddress: tokenAddress.toLowerCase(),
                    page,
                    pageSize,
                },
            });
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    errorType: 'token_voting_membership_domain_fallback',
                    daoId: queryParams.daoId,
                    pluginAddress: queryParams.pluginAddress,
                    network,
                },
            });
        }
    }

    const {
        network: _network,
        pluginInterfaceType: _pluginInterfaceType,
        tokenAddress: _tokenAddress,
        tokenUnderlying: _tokenUnderlying,
        hasVotingEscrow: _hasVotingEscrow,
        domainSourceEnabled: _domainSourceEnabled,
        ...legacyQueryParams
    } = queryParams;

    const result = await fetchLegacyMemberList({
        ...params,
        queryParams: legacyQueryParams,
    });

    return {
        ...result,
        data: result.data.map(mapBackendMemberToTokenVotingDTO),
    };
};
