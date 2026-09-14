import type { PageDTO, TokenVotingMemberDTO } from '@aragon/aragon-domain';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
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
 * tokens on the networks in `DOMAIN_NETWORKS`. Wrapped, VE-adapter tokens,
 * and every other plugin type or network continue to use the legacy backend
 * until the aragon-domain supports them.
 */
const resolveMemberSource = (
    queryParams: IGetTokenVotingMembershipQueryParams,
): 'domain' | 'backend' => {
    const pluginAddress = queryParams.pluginAddress?.toLowerCase();
    const tokenAddress = queryParams.tokenAddress?.toLowerCase();
    const network = queryParams.network;
    const interfaceType = queryParams.pluginInterfaceType;
    const tokenUnderlying = queryParams.tokenUnderlying;

    const useDomain =
        pluginAddress != null &&
        tokenAddress != null &&
        network != null &&
        DOMAIN_NETWORKS.has(network) &&
        interfaceType === PluginInterfaceType.TOKEN_VOTING &&
        tokenUnderlying == null;

    return useDomain ? 'domain' : 'backend';
};

/**
 * Routes token-voting membership queries.
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
    const { tokenAddress, page, pageSize } = queryParams;

    if (tokenAddress != null && resolveMemberSource(queryParams) === 'domain') {
        return fetchDomainMembers({
            queryParams: {
                pluginAddress: queryParams.pluginAddress.toLowerCase(),
                tokenContractAddress: tokenAddress.toLowerCase(),
                page,
                pageSize,
            },
        });
    }

    const {
        network: _network,
        pluginInterfaceType: _pluginInterfaceType,
        tokenAddress: _tokenAddress,
        tokenUnderlying: _tokenUnderlying,
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
