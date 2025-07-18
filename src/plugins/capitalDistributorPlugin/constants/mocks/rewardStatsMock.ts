import type { IBackendApiMock } from '@/shared/types';

// Mock rewards stats for any address
export const rewardStatsMock: IBackendApiMock = {
    url: /\/v1\/stats\/.+$/,
    type: 'replace',
    data: { totalClaimed: '50000', totalClaimable: '30000' },
};
