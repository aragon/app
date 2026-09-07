import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { generatePaginatedResponse } from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { IGetTokenVotingMembershipQueryParams } from '../../governanceService.api';
import { fetchTokenVotingMembership } from './fetchTokenVotingMembership';

describe('fetchTokenVotingMembership', () => {
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');

    beforeEach(() => {
        logErrorSpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        logErrorSpy.mockReset();
    });

    const baseQueryParams: IGetTokenVotingMembershipQueryParams = {
        daoId: 'dao-id',
        pluginAddress: '0xPlugin',
        tokenAddress: '0xToken',
        network: Network.ETHEREUM_MAINNET,
        pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
        domainSourceEnabled: true,
    };

    const createFetchers = () => ({
        fetchDomainMembers: jest
            .fn()
            .mockResolvedValue(generatePaginatedResponse({})),
        fetchLegacyMemberList: jest
            .fn()
            .mockResolvedValue(generatePaginatedResponse({})),
    });

    it('routes mainnet token-voting plain ERC-20 to the aragon-domain with the chain-scoped request DTO', async () => {
        const { fetchDomainMembers, fetchLegacyMemberList } = createFetchers();

        await fetchTokenVotingMembership(
            { queryParams: { ...baseQueryParams, page: 2, pageSize: 25 } },
            fetchDomainMembers,
            fetchLegacyMemberList,
        );

        expect(fetchLegacyMemberList).not.toHaveBeenCalled();
        expect(fetchDomainMembers).toHaveBeenCalledWith({
            queryParams: {
                chainId: 1,
                pluginAddress: '0xplugin',
                tokenContractAddress: '0xtoken',
                page: 2,
                pageSize: 25,
            },
        });
        expect(logErrorSpy).not.toHaveBeenCalled();
    });

    it('falls back to the legacy backend and reports the failure when the domain fetch fails', async () => {
        const { fetchDomainMembers, fetchLegacyMemberList } = createFetchers();
        const domainError = new Error('indexer down');
        fetchDomainMembers.mockRejectedValue(domainError);
        const legacyPage = generatePaginatedResponse({});
        fetchLegacyMemberList.mockResolvedValue(legacyPage);

        const result = await fetchTokenVotingMembership(
            { queryParams: baseQueryParams },
            fetchDomainMembers,
            fetchLegacyMemberList,
        );

        expect(fetchDomainMembers).toHaveBeenCalledTimes(1);
        expect(fetchLegacyMemberList).toHaveBeenCalledWith({
            queryParams: { daoId: 'dao-id', pluginAddress: '0xPlugin' },
        });
        expect(logErrorSpy).toHaveBeenCalledWith(domainError, {
            context: {
                errorType: 'token_voting_membership_domain_fallback',
                daoId: 'dao-id',
                pluginAddress: '0xPlugin',
                network: Network.ETHEREUM_MAINNET,
            },
        });
        expect(result.metadata).toEqual(legacyPage.metadata);
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
        [
            'voting-escrow backed plugin',
            { ...baseQueryParams, hasVotingEscrow: true },
        ],
        [
            'disabled domain source',
            { ...baseQueryParams, domainSourceEnabled: false },
        ],
        [
            'unset domain source flag',
            { ...baseQueryParams, domainSourceEnabled: undefined },
        ],
    ])(
        'routes to the legacy backend with stripped routing fields for %s',
        async (_label, queryParams) => {
            const { fetchDomainMembers, fetchLegacyMemberList } =
                createFetchers();

            await fetchTokenVotingMembership(
                { queryParams },
                fetchDomainMembers,
                fetchLegacyMemberList,
            );

            expect(fetchDomainMembers).not.toHaveBeenCalled();
            expect(fetchLegacyMemberList).toHaveBeenCalledWith({
                queryParams: { daoId: 'dao-id', pluginAddress: '0xPlugin' },
            });
        },
    );
});
