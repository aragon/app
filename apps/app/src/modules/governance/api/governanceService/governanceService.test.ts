import { generateLockToVotePluginSettings } from '@/plugins/lockToVotePlugin/testUtils/generators/lockToVotePluginSettings';
import { generateLockToVotePluginSettingsToken } from '@/plugins/lockToVotePlugin/testUtils/generators/lockToVotePluginSettingsToken';
import { generateLockToVoteProposal } from '@/plugins/lockToVotePlugin/testUtils/generators/lockToVoteProposal';
import { generateLockToVoteStagePlugin } from '@/plugins/lockToVotePlugin/testUtils/generators/lockToVoteStagePlugin';
import type { ILockToVoteProposal } from '@/plugins/lockToVotePlugin/types';
import { generateMultisigProposal } from '@/plugins/multisigPlugin/testUtils';
import { generateSppProposal } from '@/plugins/sppPlugin/testUtils/generators/sppProposal';
import { generateSppPluginSettings } from '@/plugins/sppPlugin/testUtils/generators/sppSettings';
import { generateSppStage } from '@/plugins/sppPlugin/testUtils/generators/sppStage';
import type { ISppProposal } from '@/plugins/sppPlugin/types';
import { generateTokenMember } from '@/plugins/tokenPlugin/testUtils';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { generatePaginatedResponse } from '@/shared/testUtils';
import {
    generateMember,
    generateProposal,
    generateVote,
} from '../../testUtils';
import { governanceService } from './governanceService';
import * as fetchTokensTotalSupplyHelpers from './utils/fetchTokensTotalSupply';

describe('governance service', () => {
    const requestSpy = jest.spyOn(governanceService, 'request');
    const fetchSpy = jest.spyOn(global, 'fetch');
    const fetchTokensTotalSupplySpy = jest.spyOn(
        fetchTokensTotalSupplyHelpers,
        'fetchTokensTotalSupply',
    );

    afterEach(() => {
        requestSpy.mockReset();
        fetchSpy.mockReset();
        fetchTokensTotalSupplySpy.mockReset();
    });

    afterAll(() => {
        fetchTokensTotalSupplySpy.mockRestore();
    });

    it('getMemberList fetches the members of the specified DAO', async () => {
        const members = [
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x456' }),
        ];
        const params = {
            queryParams: { daoId: 'dao-id-test', pluginAddress: '0x123' },
        };

        requestSpy.mockResolvedValue(members);
        const result = await governanceService.getMemberList(params);

        expect(requestSpy).toHaveBeenCalledWith(
            governanceService['urls'].members,
            params,
        );
        expect(result).toEqual(members);
    });

    it('getMemberList strips subdomain routing fields when falling through to the legacy backend', async () => {
        const members = [generateMember({ address: '0xabc' })];
        const params = {
            queryParams: {
                daoId: 'dao-id-test',
                pluginAddress: '0x123',
                network: Network.POLYGON_MAINNET,
                pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
                tokenAddress: '0xtoken',
            },
        };

        requestSpy.mockResolvedValue(members);
        await governanceService.getMemberList(params);

        expect(requestSpy).toHaveBeenCalledWith(
            governanceService['urls'].members,
            {
                queryParams: {
                    daoId: 'dao-id-test',
                    pluginAddress: '0x123',
                },
            },
        );
    });

    it.each([
        [
            'non-mainnet network',
            {
                network: Network.POLYGON_MAINNET,
                pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
                tokenAddress: '0xtoken',
            },
        ],
        [
            'non-token-voting interface type',
            {
                network: Network.ETHEREUM_MAINNET,
                pluginInterfaceType: PluginInterfaceType.MULTISIG,
                tokenAddress: '0xtoken',
            },
        ],
        [
            'missing tokenAddress',
            {
                network: Network.ETHEREUM_MAINNET,
                pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
            },
        ],
        [
            'governance token wraps an underlying (VE / wrapped)',
            {
                network: Network.ETHEREUM_MAINNET,
                pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
                tokenAddress: '0xtoken',
                tokenUnderlying: '0xunderlying',
            },
        ],
    ])('getMemberList routes to the legacy backend when %s', async (_label, routingFields) => {
        requestSpy.mockResolvedValue([]);
        await governanceService.getMemberList({
            queryParams: {
                daoId: 'dao-id-test',
                pluginAddress: '0x123',
                ...routingFields,
            },
        });

        expect(fetchSpy).not.toHaveBeenCalled();
        expect(requestSpy).toHaveBeenCalledWith(
            governanceService['urls'].members,
            expect.objectContaining({
                queryParams: expect.objectContaining({
                    pluginAddress: '0x123',
                }),
            }),
        );
    });

    it('getMemberList routes to the subdomain endpoint for token-voting plugins on Ethereum mainnet', async () => {
        const members = [generateMember({ address: '0x123' })];
        const responseBody = {
            data: members,
            metadata: {
                page: 1,
                pageSize: 10,
                totalPages: 1,
                totalRecords: 1,
            },
        };
        fetchSpy.mockResolvedValue({
            ok: true,
            json: async () => responseBody,
        } as Response);

        const result = await governanceService.getMemberList({
            queryParams: {
                daoId: 'dao-id-test',
                pluginAddress: '0xPlugin',
                tokenAddress: '0xToken',
                network: Network.ETHEREUM_MAINNET,
                pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
                page: 2,
                pageSize: 25,
            },
        });

        expect(requestSpy).not.toHaveBeenCalled();
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const calledUrl = (fetchSpy.mock.calls[0]![0] as string) ?? '';
        expect(calledUrl).toContain('/api/subdomain/members?');
        expect(calledUrl).toContain('pluginAddress=0xplugin');
        expect(calledUrl).toContain('tokenAddress=0xtoken');
        expect(calledUrl).toContain('page=2');
        expect(calledUrl).toContain('pageSize=25');
        expect(result).toEqual(responseBody);
    });

    it('getMemberList throws when the subdomain endpoint returns a non-ok response', async () => {
        fetchSpy.mockResolvedValue({
            ok: false,
            status: 500,
        } as Response);

        await expect(
            governanceService.getMemberList({
                queryParams: {
                    daoId: 'dao-id-test',
                    pluginAddress: '0xPlugin',
                    tokenAddress: '0xToken',
                    network: Network.ETHEREUM_MAINNET,
                    pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
                },
            }),
        ).rejects.toThrow('Subdomain members request failed: 500');
    });

    it('getTokenVotingMembership returns the subdomain DTO unmapped for mainnet token-voting', async () => {
        const responseBody = {
            data: [
                {
                    address: '0xabc',
                    ens: 'alice.eth',
                    votingPower: '5000',
                    metrics: {
                        firstActivityTimestamp: 1_705_320_000,
                        lastActivityTimestamp: 1_718_872_200,
                        delegationCount: 3,
                    },
                },
            ],
            metadata: {
                page: 1,
                pageSize: 10,
                totalPages: 1,
                totalRecords: 1,
            },
        };
        fetchSpy.mockResolvedValue({
            ok: true,
            json: async () => responseBody,
        } as Response);

        const result = await governanceService.getTokenVotingMembership({
            queryParams: {
                daoId: 'dao-id-test',
                pluginAddress: '0xPlugin',
                tokenAddress: '0xToken',
                network: Network.ETHEREUM_MAINNET,
                pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
            },
        });

        expect(requestSpy).not.toHaveBeenCalled();
        const calledUrl = (fetchSpy.mock.calls[0]![0] as string) ?? '';
        expect(calledUrl).toContain('/api/subdomain/members?');
        expect(result).toEqual(responseBody);
    });

    it('getTokenVotingMembership maps the backend members to DTOs when routing to the legacy backend', async () => {
        const member = generateTokenMember({
            address: '0xabc',
            ens: 'alice.eth',
            votingPower: '5000',
            type: 'token-voting',
            firstActive: 100,
            lastActive: 200,
            metrics: {
                firstActivityTimestamp: 1_705_320_000,
                lastActivityTimestamp: 1_718_872_200,
                delegationCount: 3,
            },
        });
        requestSpy.mockResolvedValue(
            generatePaginatedResponse({ data: [member] }),
        );

        const result = await governanceService.getTokenVotingMembership({
            queryParams: {
                daoId: 'dao-id-test',
                pluginAddress: '0xPlugin',
                tokenAddress: '0xToken',
                // Non-mainnet → backend branch.
                network: Network.POLYGON_MAINNET,
                pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
            },
        });

        expect(fetchSpy).not.toHaveBeenCalled();
        // Routing-only fields are stripped before hitting the backend.
        expect(requestSpy).toHaveBeenCalledWith(
            governanceService['urls'].members,
            {
                queryParams: {
                    daoId: 'dao-id-test',
                    pluginAddress: '0xPlugin',
                },
            },
        );
        expect(result.data).toEqual([
            {
                address: '0xabc',
                ens: 'alice.eth',
                votingPower: '5000',
                metrics: {
                    firstActivityTimestamp: 1_705_320_000,
                    lastActivityTimestamp: 1_718_872_200,
                    delegationCount: 3,
                },
            },
        ]);
        expect(result.data[0]).not.toHaveProperty('type');
        expect(result.data[0]).not.toHaveProperty('firstActive');
    });

    it('getMember fetches the member of the specified DAO by address', async () => {
        const member = generateMember({ address: '0x123' });
        const params = {
            urlParams: { address: member.address },
            queryParams: {
                daoId: 'dao-id-test',
                pluginAddress: 'test-plugin-address',
            },
        };

        requestSpy.mockResolvedValue(member);
        const result = await governanceService.getMember(params);

        expect(requestSpy).toHaveBeenCalledWith(
            governanceService['urls'].member,
            params,
        );
        expect(result).toEqual(member);
    });

    it('getProposalList fetches proposals of the specified DAO and skips the supply fetch when no lock-to-vote bodies are present', async () => {
        const proposals = generatePaginatedResponse({
            data: [
                generateProposal({ id: '0' }),
                generateProposal({ id: '1' }),
            ],
        });
        const params = {
            queryParams: { daoId: 'dao-id-test', pluginAddress: '0x123' },
        };

        requestSpy.mockResolvedValue(proposals);
        const result = await governanceService.getProposalList(params);

        expect(requestSpy).toHaveBeenCalledWith(
            governanceService['urls'].proposals,
            params,
        );
        expect(result).toEqual(proposals);
        expect(fetchTokensTotalSupplySpy).not.toHaveBeenCalled();
    });

    it('getProposalList merges tokensTotalSupply onto lock-to-vote proposals in the page', async () => {
        const tokenAddress = '0xAaaa';
        const proposals = generatePaginatedResponse<ILockToVoteProposal>({
            data: [
                generateLockToVoteProposal({
                    id: '0',
                    network: Network.ETHEREUM_MAINNET,
                    pluginInterfaceType: PluginInterfaceType.LOCK_TO_VOTE,
                    settings: generateLockToVotePluginSettings({
                        token: generateLockToVotePluginSettingsToken({
                            address: tokenAddress,
                        }),
                    }),
                }),
            ],
        });
        const params = {
            queryParams: { daoId: 'dao-id-test', pluginAddress: '0x123' },
        };
        requestSpy.mockResolvedValue(proposals);
        fetchTokensTotalSupplySpy.mockResolvedValue({
            [tokenAddress.toLowerCase()]: '1000',
        });

        const result =
            await governanceService.getProposalList<ILockToVoteProposal>(
                params,
            );

        expect(fetchTokensTotalSupplySpy).toHaveBeenCalledTimes(1);
        expect(result.data[0].tokensTotalSupply).toEqual({
            [tokenAddress.toLowerCase()]: '1000',
        });
    });

    it('getProposalList throws when proposals in the page have different networks', async () => {
        const tokenAddress = '0xAaaa';
        const proposals = generatePaginatedResponse<ILockToVoteProposal>({
            data: [
                generateLockToVoteProposal({
                    id: '0',
                    network: Network.ETHEREUM_MAINNET,
                    pluginInterfaceType: PluginInterfaceType.LOCK_TO_VOTE,
                    settings: generateLockToVotePluginSettings({
                        token: generateLockToVotePluginSettingsToken({
                            address: tokenAddress,
                        }),
                    }),
                }),
                generateLockToVoteProposal({
                    id: '1',
                    network: Network.BASE_MAINNET,
                    pluginInterfaceType: PluginInterfaceType.LOCK_TO_VOTE,
                    settings: generateLockToVotePluginSettings({
                        token: generateLockToVotePluginSettingsToken({
                            address: tokenAddress,
                        }),
                    }),
                }),
            ],
        });
        const params = {
            queryParams: { daoId: 'dao-id-test', pluginAddress: '0x123' },
        };
        requestSpy.mockResolvedValue(proposals);

        await expect(
            governanceService.getProposalList<ILockToVoteProposal>(params),
        ).rejects.toThrow(
            'GovernanceService.getProposalList: all proposals must share the same network',
        );
        expect(fetchTokensTotalSupplySpy).not.toHaveBeenCalled();
    });

    it('getProposalBySlug fetches the proposal with the correct slug and incremental ID', async () => {
        const proposal = generateProposal({ id: '001', incrementalId: 1 });
        const proposalParams = {
            urlParams: { slug: proposal.id },
            queryParams: { daoId: 'test-id' },
        };

        requestSpy.mockResolvedValue(proposal);
        const result =
            await governanceService.getProposalBySlug(proposalParams);

        expect(requestSpy).toHaveBeenCalledWith(
            governanceService['urls'].proposalBySlug,
            proposalParams,
        );
        expect(result).toEqual(proposal);
        expect(fetchTokensTotalSupplySpy).not.toHaveBeenCalled();
    });

    it('getProposalBySlug merges tokensTotalSupply onto a standalone lock-to-vote proposal', async () => {
        const tokenAddress = '0xBbBb';
        const proposal = generateLockToVoteProposal({
            id: '002',
            network: Network.ETHEREUM_MAINNET,
            pluginInterfaceType: PluginInterfaceType.LOCK_TO_VOTE,
            settings: generateLockToVotePluginSettings({
                token: generateLockToVotePluginSettingsToken({
                    address: tokenAddress,
                }),
            }),
        });
        const proposalParams = {
            urlParams: { slug: proposal.id },
            queryParams: { daoId: 'test-id' },
        };
        requestSpy.mockResolvedValue(proposal);
        fetchTokensTotalSupplySpy.mockResolvedValue({
            [tokenAddress.toLowerCase()]: '5000',
        });

        const result =
            await governanceService.getProposalBySlug<ILockToVoteProposal>(
                proposalParams,
            );

        expect(result.tokensTotalSupply).toEqual({
            [tokenAddress.toLowerCase()]: '5000',
        });
    });

    it('getProposalBySlug merges tokensTotalSupply onto LTV sub-proposals only (non-LTV subs and SPP parent untouched)', async () => {
        const tokenAddress = '0xBbBb';
        const ltvSub = {
            ...generateLockToVoteProposal({
                id: 'sub-ltv',
                pluginInterfaceType: PluginInterfaceType.LOCK_TO_VOTE,
                settings: generateLockToVotePluginSettings({
                    token: generateLockToVotePluginSettingsToken({
                        address: tokenAddress,
                    }),
                }),
            }),
            stageIndex: 0,
        };
        const multisigSub = {
            ...generateMultisigProposal({
                id: 'sub-multisig',
                pluginInterfaceType: PluginInterfaceType.MULTISIG,
            }),
            stageIndex: 0,
        };
        const proposal = generateSppProposal({
            id: '002',
            network: Network.ETHEREUM_MAINNET,
            pluginInterfaceType: PluginInterfaceType.SPP,
            settings: generateSppPluginSettings({
                stages: [
                    generateSppStage({
                        plugins: [
                            generateLockToVoteStagePlugin({
                                settings: generateLockToVotePluginSettings({
                                    token: generateLockToVotePluginSettingsToken(
                                        { address: tokenAddress },
                                    ),
                                }),
                            }),
                        ],
                    }),
                ],
            }),
            subProposals: [ltvSub, multisigSub],
        });
        const proposalParams = {
            urlParams: { slug: proposal.id },
            queryParams: { daoId: 'test-id' },
        };
        requestSpy.mockResolvedValue(proposal);
        fetchTokensTotalSupplySpy.mockResolvedValue({
            [tokenAddress.toLowerCase()]: '5000',
        });

        const result =
            await governanceService.getProposalBySlug<ISppProposal>(
                proposalParams,
            );

        expect(
            (result as ISppProposal & { tokensTotalSupply?: unknown })
                .tokensTotalSupply,
        ).toBeUndefined();
        const [decoratedLtvSub, decoratedMultisigSub] = result.subProposals as [
            ILockToVoteProposal,
            (typeof result.subProposals)[number],
        ];
        expect(decoratedLtvSub.tokensTotalSupply).toEqual({
            [tokenAddress.toLowerCase()]: '5000',
        });
        expect(
            (decoratedMultisigSub as { tokensTotalSupply?: unknown })
                .tokensTotalSupply,
        ).toBeUndefined();
    });

    it('getProposalBySlug leaves non-LTV non-SPP proposals untouched', async () => {
        const proposal = generateProposal({
            id: '003',
            pluginInterfaceType: PluginInterfaceType.MULTISIG,
        });
        const proposalParams = {
            urlParams: { slug: proposal.id },
            queryParams: { daoId: 'test-id' },
        };
        requestSpy.mockResolvedValue(proposal);

        const result = (await governanceService.getProposalBySlug(
            proposalParams,
        )) as typeof proposal & { tokensTotalSupply?: unknown };

        expect(fetchTokensTotalSupplySpy).not.toHaveBeenCalled();
        expect(result.tokensTotalSupply).toBeUndefined();
    });

    it('getCanCreateProposal fetches if the member can create a proposal on the specified plugin', async () => {
        const canCreateProposal = true;
        const params = {
            queryParams: {
                memberAddress: '0x123',
                pluginAddress: '0x456',
                network: Network.BASE_MAINNET,
            },
        };

        requestSpy.mockResolvedValue(canCreateProposal);
        const result = await governanceService.getCanCreateProposal(params);

        expect(requestSpy).toHaveBeenCalledWith(
            governanceService['urls'].canCreateProposal,
            params,
        );
        expect(result).toEqual(canCreateProposal);
    });

    it('getVoteList fetches the votes of a specific proposal', async () => {
        const votes = [
            generateVote({ transactionHash: '0' }),
            generateVote({ transactionHash: '1' }),
        ];
        const params = {
            queryParams: {
                proposalId: 'proposal-id',
                pluginAddress: '0x123',
                network: Network.BASE_MAINNET,
            },
        };

        requestSpy.mockResolvedValue(votes);
        const result = await governanceService.getVoteList(params);

        expect(requestSpy).toHaveBeenCalledWith(
            governanceService['urls'].votes,
            params,
        );
        expect(result).toEqual(votes);
    });
});
