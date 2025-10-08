import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IGetGaugeListParams, IGetGaugeListResult } from './gaugeVoterService.api';

class GaugeVoterService extends AragonBackendService {
    private urls = {
        gauges: '/v2/gauges/:userAddress',
    };

    getGaugeList = async ({
        // urlParams,
        queryParams,
    }: IGetGaugeListParams): Promise<IPaginatedResponse<IGetGaugeListResult>> => {
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
                            icon: 'https://pbs.twimg.com/profile_images/1721880644345622528/G2czctJJ_400x400.jpg',
                            totalVotes: 1000000,
                            userVotes: 0,
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
                            address: '0x9834',
                            name: 'Ionic',
                            description:
                                'Ionic is a powerful protocol that enables the creation of nested NFTs by allowing ordinary NFTs to contain a digital "charge" inside — ERC20, ERC721 or ERC1155 — giving you the unprecedented power to create nested NFTs. If you can digitize it, you can deposit it into your NFTs.',
                            icon: 'https://raw.githubusercontent.com/mode-network/brandkit/refs/heads/main/Assets/Logo/Token.png',
                            totalVotes: 1000000,
                            userVotes: 100,
                            resources: [],
                        },
                    ],
                    metrics: {
                        epochId: 'epoch-1',
                        isVotingPeriod: true,
                        endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
                        totalVotes: 0,
                        votingPower: 1000,
                        usedVotingPower: 0,
                    },
                },
            ],
            metadata: {
                page: queryParams.page ?? 1,
                pageSize: queryParams.pageSize ?? 10,
                totalPages: 1,
                totalRecords: 1,
            },
        };
    };
}

export const gaugeVoterService = new GaugeVoterService();
