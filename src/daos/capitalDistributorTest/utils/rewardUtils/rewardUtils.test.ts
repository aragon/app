import type { IRewardDistributionOwner } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { rewardUtils } from './rewardUtils';

const generateOwner = (
    data?: Partial<IRewardDistributionOwner>,
): IRewardDistributionOwner => ({
    owner: '0xabc',
    votingPower: '100',
    rewardAmount: '1000',
    tokenIds: [],
    ...data,
});

describe('reward utils', () => {
    describe('toRewardJson', () => {
        it('returns correct reward amounts for each owner', () => {
            const owners = [
                generateOwner({ owner: '0xaaa', rewardAmount: '500' }),
                generateOwner({ owner: '0xbbb', rewardAmount: '500' }),
            ];

            const result = rewardUtils.toRewardJson({ owners });

            expect(result).toEqual([
                { address: '0xaaa', amount: '500' },
                { address: '0xbbb', amount: '500' },
            ]);
        });

        it('preserves rewardAmount as-is from the owner entry', () => {
            const owners = [
                generateOwner({ owner: '0xaaa', rewardAmount: '3333' }),
            ];

            const result = rewardUtils.toRewardJson({ owners });

            expect(result).toEqual([{ address: '0xaaa', amount: '3333' }]);
        });

        it('handles a single owner', () => {
            const owners = [
                generateOwner({ owner: '0xaaa', rewardAmount: '999' }),
            ];

            const result = rewardUtils.toRewardJson({ owners });

            expect(result).toEqual([{ address: '0xaaa', amount: '999' }]);
        });

        it('returns zero amounts when rewardAmount is 0', () => {
            const owners = [
                generateOwner({ owner: '0xaaa', rewardAmount: '0' }),
            ];

            const result = rewardUtils.toRewardJson({ owners });

            expect(result).toEqual([{ address: '0xaaa', amount: '0' }]);
        });

        it('handles multiple owners with varying reward amounts', () => {
            const owners = [
                generateOwner({ owner: '0x01', rewardAmount: '500000' }),
                generateOwner({ owner: '0x02', rewardAmount: '350000' }),
                generateOwner({ owner: '0x03', rewardAmount: '30000' }),
                generateOwner({ owner: '0x04', rewardAmount: '25000' }),
                generateOwner({ owner: '0x05', rewardAmount: '20000' }),
            ];

            const result = rewardUtils.toRewardJson({ owners });

            expect(result).toEqual([
                { address: '0x01', amount: '500000' },
                { address: '0x02', amount: '350000' },
                { address: '0x03', amount: '30000' },
                { address: '0x04', amount: '25000' },
                { address: '0x05', amount: '20000' },
            ]);
        });

        it('returns empty array when owners is empty', () => {
            const result = rewardUtils.toRewardJson({ owners: [] });

            expect(result).toEqual([]);
        });
    });
});
