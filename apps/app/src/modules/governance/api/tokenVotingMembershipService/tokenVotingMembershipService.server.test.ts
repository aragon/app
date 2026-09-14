/** @jest-environment node */

import { generateTokenMember } from '@/plugins/tokenPlugin/testUtils';
import { aragonDomainServiceBackend } from '@/shared/api/aragonDomainService/aragonDomainService.backend';
import {
    daoService,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import {
    generateDao,
    generateDaoPlugin,
    generatePaginatedResponse,
    generatePluginSettings,
} from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { governanceService } from '../governanceService/governanceService';
import { tokenVotingMembershipServiceServer } from './tokenVotingMembershipService.server';

const daoId = 'ethereum-mainnet-0x1111111111111111111111111111111111111111';
const pluginAddress = '0x2222222222222222222222222222222222222222';
const tokenAddress = '0x3333333333333333333333333333333333333333';

const generateDomainPage = () => ({
    data: [
        {
            address: '0xabc',
            ens: 'alice.eth',
            votingPower: '5000',
            firstActivityTimestamp: '2024-01-15T12:00:00.000Z',
            lastActivityTimestamp: '2024-06-20T08:30:00.000Z',
            delegationCount: 3,
        },
    ],
    metadata: { page: 1, pageSize: 10, totalPages: 2, totalRecords: 12 },
});

describe('tokenVotingMembershipService (server)', () => {
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const getDomainSpy = jest.spyOn(aragonDomainServiceBackend, 'getDomain');
    const getMemberListSpy = jest.spyOn(governanceService, 'getMemberList');
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');
    const getTokenVotingMembership = jest.fn();

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
        getDaoSpy.mockResolvedValue(
            generateDao({
                network: Network.ETHEREUM_MAINNET,
                plugins: [
                    generateDaoPlugin({
                        address: pluginAddress,
                        interfaceType: PluginInterfaceType.TOKEN_VOTING,
                        settings: {
                            ...generatePluginSettings(),
                            token: { address: tokenAddress },
                        },
                    }),
                ],
            }),
        );
        getDomainSpy.mockReturnValue({
            getTokenVotingMembership,
        } as unknown as ReturnType<
            typeof aragonDomainServiceBackend.getDomain
        >);
        getTokenVotingMembership.mockResolvedValue({
            success: true,
            result: generateDomainPage(),
        });
        getMemberListSpy.mockResolvedValue(generatePaginatedResponse({}));
        logErrorSpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        getDaoSpy.mockReset();
        getDomainSpy.mockReset();
        getTokenVotingMembership.mockReset();
        getMemberListSpy.mockReset();
        logErrorSpy.mockReset();
    });

    it('serves an eligible plugin from the domain and tags the page with its source', async () => {
        const result =
            await tokenVotingMembershipServiceServer.getTokenVotingMembership({
                queryParams: { daoId, pluginAddress, pageSize: 10 },
            });

        expect(getTokenVotingMembership).toHaveBeenCalledWith({
            chainId: 1,
            pluginAddress: pluginAddress.toLowerCase(),
            tokenContractAddress: tokenAddress.toLowerCase(),
            page: undefined,
            pageSize: 10,
        });
        expect(getMemberListSpy).not.toHaveBeenCalled();
        expect(result.source).toBe('domain');
        expect(result.data).toEqual(generateDomainPage().data);
    });

    it('serves the legacy backend when the feature flag is off, without resolving the DAO', async () => {
        isEnabledSpy.mockResolvedValue(false);

        const result =
            await tokenVotingMembershipServiceServer.getTokenVotingMembership({
                queryParams: { daoId, pluginAddress },
            });

        expect(getDaoSpy).not.toHaveBeenCalled();
        expect(getTokenVotingMembership).not.toHaveBeenCalled();
        expect(getMemberListSpy).toHaveBeenCalledWith({
            queryParams: {
                daoId,
                pluginAddress,
                page: undefined,
                pageSize: undefined,
            },
        });
        expect(result.source).toBe('backend');
    });

    it('maps legacy members to the DTO shape', async () => {
        isEnabledSpy.mockResolvedValue(false);
        const member = generateTokenMember({
            address: '0xabc',
            ens: 'alice.eth',
            votingPower: '5000',
            metrics: {
                firstActivity: 100,
                lastActivity: 200,
                delegationCount: 3,
            },
        });
        getMemberListSpy.mockResolvedValue(
            generatePaginatedResponse({ data: [member] }),
        );

        const result =
            await tokenVotingMembershipServiceServer.getTokenVotingMembership({
                queryParams: { daoId, pluginAddress },
            });

        expect(result.data).toEqual([
            {
                address: '0xabc',
                ens: 'alice.eth',
                votingPower: '5000',
                firstActivityTimestamp: null,
                lastActivityTimestamp: null,
                delegationCount: 3,
            },
        ]);
    });

    it('keeps a list pinned to the backend when the previous page came from it', async () => {
        await tokenVotingMembershipServiceServer.getTokenVotingMembership({
            queryParams: { daoId, pluginAddress, page: 2, source: 'backend' },
        });

        expect(isEnabledSpy).not.toHaveBeenCalled();
        expect(getTokenVotingMembership).not.toHaveBeenCalled();
        expect(getMemberListSpy).toHaveBeenCalled();
    });

    it('falls back to the backend when the domain fails on the first page and logs the swallowed error', async () => {
        const error = new Error('envio is down');
        getTokenVotingMembership.mockRejectedValue(error);

        const result =
            await tokenVotingMembershipServiceServer.getTokenVotingMembership({
                queryParams: { daoId, pluginAddress },
            });

        expect(result.source).toBe('backend');
        expect(getMemberListSpy).toHaveBeenCalled();
        expect(logErrorSpy).toHaveBeenCalledTimes(1);
        expect(logErrorSpy).toHaveBeenCalledWith(error, {
            context: {
                errorType: 'token_voting_membership_domain_error',
                daoId,
                pluginAddress,
                page: undefined,
            },
        });
    });

    it('throws instead of mixing sources when the domain fails mid-list, leaving the logging to the caller', async () => {
        getTokenVotingMembership.mockRejectedValue(new Error('envio is down'));

        await expect(
            tokenVotingMembershipServiceServer.getTokenVotingMembership({
                queryParams: {
                    daoId,
                    pluginAddress,
                    page: 3,
                    source: 'domain',
                },
            }),
        ).rejects.toThrow('envio is down');
        expect(getMemberListSpy).not.toHaveBeenCalled();
        expect(logErrorSpy).not.toHaveBeenCalled();
    });

    it('throws instead of continuing a domain list on the backend when the flag is turned off between pages', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(
            tokenVotingMembershipServiceServer.getTokenVotingMembership({
                queryParams: {
                    daoId,
                    pluginAddress,
                    page: 2,
                    source: 'domain',
                },
            }),
        ).rejects.toThrow('the domain no longer serves a list it started');
        expect(getMemberListSpy).not.toHaveBeenCalled();
    });

    it('throws instead of continuing a domain list on the backend when the DAO cannot be resolved mid-list', async () => {
        getDaoSpy.mockRejectedValue(new Error('dao not found'));

        await expect(
            tokenVotingMembershipServiceServer.getTokenVotingMembership({
                queryParams: {
                    daoId,
                    pluginAddress,
                    page: 2,
                    source: 'domain',
                },
            }),
        ).rejects.toThrow('dao not found');
        expect(getMemberListSpy).not.toHaveBeenCalled();
        expect(logErrorSpy).not.toHaveBeenCalled();
    });

    it('serves the backend when the DAO cannot be resolved on the first page', async () => {
        getDaoSpy.mockRejectedValue(new Error('dao not found'));

        const result =
            await tokenVotingMembershipServiceServer.getTokenVotingMembership({
                queryParams: { daoId, pluginAddress },
            });

        expect(getTokenVotingMembership).not.toHaveBeenCalled();
        expect(result.source).toBe('backend');
        expect(logErrorSpy).toHaveBeenCalledTimes(1);
    });
});
