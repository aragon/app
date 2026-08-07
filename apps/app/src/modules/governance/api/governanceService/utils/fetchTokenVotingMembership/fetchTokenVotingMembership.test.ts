import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { generatePaginatedResponse } from '@/shared/testUtils';
import type { IGetTokenVotingMembershipQueryParams } from '../../governanceService.api';
import { fetchTokenVotingMembership } from './fetchTokenVotingMembership';

describe('fetchTokenVotingMembership', () => {
    const baseQueryParams: IGetTokenVotingMembershipQueryParams = {
        daoId: 'dao-id',
        pluginAddress: '0xPlugin',
        tokenAddress: '0xToken',
        network: Network.ETHEREUM_MAINNET,
        pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
    };

    const createFetchers = () => ({
        fetchDomainMembers: jest
            .fn()
            .mockResolvedValue(generatePaginatedResponse({})),
        fetchLegacyMemberList: jest
            .fn()
            .mockResolvedValue(generatePaginatedResponse({})),
    });

    it('routes mainnet token-voting plain ERC-20 to the aragon-domain with the request DTO', async () => {
        const { fetchDomainMembers, fetchLegacyMemberList } = createFetchers();

        await fetchTokenVotingMembership(
            { queryParams: { ...baseQueryParams, page: 2, pageSize: 25 } },
            fetchDomainMembers,
            fetchLegacyMemberList,
        );

        expect(fetchLegacyMemberList).not.toHaveBeenCalled();
        expect(fetchDomainMembers).toHaveBeenCalledWith({
            queryParams: {
                pluginAddress: '0xplugin',
                tokenContractAddress: '0xtoken',
                page: 2,
                pageSize: 25,
            },
        });
    });

    it.each([
        [
            'non-mainnet network',
            { ...baseQueryParams, network: Network.POLYGON_MAINNET },
        ],
        [
            'non-token-voting interface type',
            {
                ...baseQueryParams,
                pluginInterfaceType: PluginInterfaceType.MULTISIG,
            },
        ],
        [
            'missing tokenAddress',
            { ...baseQueryParams, tokenAddress: undefined },
        ],
        ['missing network', { ...baseQueryParams, network: undefined }],
        [
            'wrapped / VE-adapter governance token',
            { ...baseQueryParams, tokenUnderlying: '0xunderlying' },
        ],
    ])('routes to the legacy backend with stripped routing fields for %s', async (_label, queryParams) => {
        const { fetchDomainMembers, fetchLegacyMemberList } = createFetchers();

        await fetchTokenVotingMembership(
            { queryParams },
            fetchDomainMembers,
            fetchLegacyMemberList,
        );

        expect(fetchDomainMembers).not.toHaveBeenCalled();
        expect(fetchLegacyMemberList).toHaveBeenCalledWith({
            queryParams: { daoId: 'dao-id', pluginAddress: '0xPlugin' },
        });
    });
});
