import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IGetGaugeListParams, IGetGaugeListResult } from './gaugeVoterService.api';

class GaugeVoterService extends AragonBackendService {
    private urls = {
        gauges: '/v2/gauges/:userAddress',
    };

    getGaugeList = async (
        { queryParams }: IGetGaugeListParams,
        debugHasVoted = false,
        debugIsVotingPeriod = false,
    ): Promise<IPaginatedResponse<IGetGaugeListResult>> => {
        // TODO: Replace with actual API call when backend is implemented
        // const result = await this.request<IPaginatedResponse<IGetGaugeListResult>>(
        //     this.urls.gauges.replace(':userAddress', urlParams.userAddress),
        //     { queryParams }
        // );
        // return result;

        // Placeholder implementation for development
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate async call

        return {
            data: [
                {
                    gauges: [
                        {
                            address: '0x1234567890123456789012345678901234567890',
                            name: 'Charged Particles',
                            description:
                                'Charged Particles is the groundbreaking protocol that lets you put digital assets inside your NFTs. Now, ordinary NFTs (think neutral molecules) can contain a digital "charge" inside — ERC20, ERC721 or ERC1155 — giving you the unprecedented power to create nested NFTs. If you can digitize it, you can deposit it into your NFTs.',
                            logo: 'https://pbs.twimg.com/profile_images/1721880644345622528/G2czctJJ_400x400.jpg',
                            totalVotes: 432345,
                            userVotes: debugHasVoted ? 16000 : 0,
                            resources: [
                                {
                                    name: 'Website',
                                    url: 'https://charged.fi',
                                },
                                {
                                    name: 'Docs',
                                    url: 'https://forum.charged.fi',
                                },
                            ],
                        },
                        {
                            address: '0x9834567890123456789012345678901234569834',
                            name: 'Ionic',
                            description: 'Ionic is a powerful protocol that enables the creation of nested NFTs.',
                            logo: 'https://raw.githubusercontent.com/mode-network/brandkit/refs/heads/main/Assets/Logo/Token.png',
                            totalVotes: 287612,
                            userVotes: debugHasVoted ? 12000 : 0,
                            resources: [],
                        },
                        {
                            address: '0x5678901234567890123456789012345678905678',
                            name: 'DeFi Forge',
                            description:
                                'DeFi Forge is a decentralized liquidity protocol where users can earn yield on their crypto assets through optimized farming strategies and automated market making.',
                            logo: 'https://aragon-1.mypinata.cloud/ipfs/QmRXNfeMtFVGuuJFLFBj8WuH6ZjMr6kykzNfesinF5mhA7',
                            totalVotes: 354891,
                            userVotes: 0,
                            resources: [
                                {
                                    name: 'Website',
                                    url: 'https://defiforge.io',
                                },
                                {
                                    name: 'Twitter',
                                    url: 'https://twitter.com/defiforge',
                                },
                                {
                                    name: 'Discord',
                                    url: 'https://discord.gg/defiforge',
                                },
                            ],
                        },
                        {
                            address: '0x7890123456789012345678901234567890127890',
                            name: 'ZeroSwap Finance',
                            description:
                                'ZeroSwap is a multi-chain compatible decentralized exchange aggregator providing the best swap rates across multiple DEXs with zero-knowledge privacy features.',
                            logo: 'https://pbs.twimg.com/profile_images/1823377013186691072/jPGLrNT0_400x400.png',
                            totalVotes: 198473,
                            userVotes: 0,
                            resources: [
                                {
                                    name: 'Website',
                                    url: 'https://zeroswap.finance',
                                },
                                {
                                    name: 'Docs',
                                    url: 'https://docs.zeroswap.finance',
                                },
                            ],
                        },
                        {
                            address: '0xabcdef1234567890abcdef1234567890abcdef12',
                            name: 'Nebula Staking',
                            description:
                                'Nebula Staking offers institutional-grade liquid staking solutions with enhanced security and the highest APY in the ecosystem through strategic validator partnerships.',
                            logo: 'https://pbs.twimg.com/profile_images/1937810644964716545/LDiOF-l0_400x400.jpg',
                            totalVotes: 226679,
                            userVotes: 0,
                            resources: [
                                {
                                    name: 'Website',
                                    url: 'https://nebulastaking.com',
                                },
                                {
                                    name: 'Audits',
                                    url: 'https://nebulastaking.com/audits',
                                },
                                {
                                    name: 'Blog',
                                    url: 'https://blog.nebulastaking.com',
                                },
                            ],
                        },
                    ],
                    metrics: {
                        epochId: 'epoch-1',
                        isVotingPeriod: debugIsVotingPeriod,
                        endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
                        totalVotes: 1500000,
                        votingPower: 28000,
                        usedVotingPower: debugHasVoted ? 28000 : 0,
                    },
                },
            ],
            metadata: {
                page: queryParams.page ?? 1,
                pageSize: queryParams.pageSize ?? 10,
                totalPages: 2,
                totalRecords: 12,
            },
        };
    };
}

export const gaugeVoterService = new GaugeVoterService();
