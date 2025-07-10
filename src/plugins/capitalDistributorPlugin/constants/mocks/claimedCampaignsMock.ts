import { sepoliaTokensMock } from '@/shared/constants/mocks';
import type { IBackendApiMock } from '@/shared/types';

// Mock claimed campaigns for any address
export const claimedCampaignsMock: IBackendApiMock[] = [
    {
        url: /\/v1\/campaigns\?pageSize=[0-9]+&page=1+&status=claimed&memberAddress=.*$/,
        type: 'replace',
        data: {
            metadata: { page: 1, pageSize: 5, totalPages: 1, totalRecords: 3 },
            data: [
                {
                    id: 1,
                    title: 'Community Rewards',
                    description:
                        'Reward for community engagement Reward for community engagement Reward for community engagement Reward for community engagement Reward for community engagement Reward for community engagement Reward for community engagementReward for community engagement',
                    type: 'retro',
                    resources: [{ name: 'Learn More', url: 'https://aragon.org' }],
                    status: 'claimed',
                    token: sepoliaTokensMock.usdc,
                    amount: '198480000',
                    startTime: 1750602680,
                    endTime: 1751034680,
                    txHash: '0x6ebcf52c7b2e40de87332b2dc891719e',
                    claimTimestamp: 1751034680,
                    active: false,
                },
                {
                    id: 2,
                    title: 'Staking Rewards',
                    description: 'Reward for staking tokens',
                    type: 'bounty',
                    status: 'claimed',
                    token: sepoliaTokensMock.usdc,
                    amount: '907720000',
                    startTime: 1750170680,
                    endTime: 1751034680,
                    txHash: '0xe103baca0e04439ebbf121b840e42c4b',
                    active: false,
                    claimTimestamp: 1651034680,
                },
                {
                    id: 4,
                    title: 'Community Rewards',
                    description: 'Reward for community engagement',
                    type: 'grant',
                    resources: [{ name: 'Learn More', url: 'https://aragon.org' }],
                    status: 'claimed',
                    token: sepoliaTokensMock.link,
                    amount: '319820000000000000000',
                    startTime: 0,
                    endTime: 0,
                    txHash: '0xcf9c9cdc27494e259a516c223a6aa77a',
                    active: false,
                    claimTimestamp: 1751034650,
                },
            ],
        },
    },
];
