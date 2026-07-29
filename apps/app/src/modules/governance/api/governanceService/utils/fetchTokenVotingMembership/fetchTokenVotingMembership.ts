import type { PageDTO, TokenVotingMemberDTO } from '@aragon/aragon-domain';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IGetTokenVotingMembersParams } from '../../../tokenVotingMembershipService';
import type {
    IGetMemberListParams,
    IGetTokenVotingMembershipParams,
} from '../../governanceService.api';
import { mapBackendMemberToTokenVotingDTO } from '../mapBackendMemberToTokenVotingDTO';
import { resolveMemberSource } from '../resolveMemberSource';

export type FetchDomainTokenVotingMembers = (
    params: IGetTokenVotingMembersParams,
) => Promise<PageDTO<TokenVotingMemberDTO>>;

export type FetchLegacyMemberList = (
    params: IGetMemberListParams,
) => Promise<IPaginatedResponse<ITokenMember>>;

/**
 * Single source-routing implementation for token-voting membership queries,
 * shared by the client fetch (`governanceService.getTokenVotingMembership`)
 * and the server prefetch (`tokenVotingMembershipOptionsServer`). The two
 * entry points only differ in their aragon-domain transport (BFF route vs
 * in-process controller), injected as `fetchDomainMembers`.
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
