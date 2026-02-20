import type { IRewardDistributionOwner } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { rewardUtils } from './rewardUtils';

const generateOwner = (
    data?: Partial<IRewardDistributionOwner>,
): IRewardDistributionOwner => ({
    owner: '0xabc',
    votingPower: '100',
    shareBps: 10_000,
    tokenIds: [],
    ...data,
});

describe('reward utils', () => {
    describe('toRewardJson', () => {
        it('returns correct reward amounts for each owner', () => {
            const owners = [
                generateOwner({ owner: '0xaaa', shareBps: 5000 }),
                generateOwner({ owner: '0xbbb', shareBps: 5000 }),
            ];

            const result = rewardUtils.toRewardJson({
                owners,
                totalAmount: BigInt(1000),
            });

            expect(result).toEqual({ '0xaaa': '500', '0xbbb': '500' });
        });

        it('floors fractional reward amounts', () => {
            const owners = [generateOwner({ owner: '0xaaa', shareBps: 3333 })];

            const result = rewardUtils.toRewardJson({
                owners,
                totalAmount: BigInt(10_000),
            });

            expect(result).toEqual({ '0xaaa': '3333' });
        });

        it('handles a single owner with full share', () => {
            const owners = [
                generateOwner({ owner: '0xaaa', shareBps: 10_000 }),
            ];

            const result = rewardUtils.toRewardJson({
                owners,
                totalAmount: BigInt(999),
            });

            expect(result).toEqual({ '0xaaa': '999' });
        });

        it('returns zero amounts when totalAmount is 0', () => {
            const owners = [generateOwner({ owner: '0xaaa', shareBps: 5000 })];

            const result = rewardUtils.toRewardJson({
                owners,
                totalAmount: BigInt(0),
            });

            expect(result).toEqual({ '0xaaa': '0' });
        });

        it('distributes 85% to the two largest owners and splits the remainder across 8 others', () => {
            // 2 dominant owners hold 85% combined (5000 + 3500 bps)
            // 8 remaining owners split the leftover 15% (1500 bps) in varying amounts
            const owners = [
                generateOwner({ owner: '0x01', shareBps: 5000 }), // 50%
                generateOwner({ owner: '0x02', shareBps: 3500 }), // 35%
                generateOwner({ owner: '0x03', shareBps: 300 }),
                generateOwner({ owner: '0x04', shareBps: 250 }),
                generateOwner({ owner: '0x05', shareBps: 200 }),
                generateOwner({ owner: '0x06', shareBps: 175 }),
                generateOwner({ owner: '0x07', shareBps: 150 }),
                generateOwner({ owner: '0x08', shareBps: 150 }),
                generateOwner({ owner: '0x09', shareBps: 150 }),
                generateOwner({ owner: '0x10', shareBps: 125 }),
            ]; // total: 10_000 bps

            const result = rewardUtils.toRewardJson({
                owners,
                totalAmount: BigInt(1_000_000),
            });

            expect(result).toEqual({
                '0x01': '500000',
                '0x02': '350000',
                '0x03': '30000',
                '0x04': '25000',
                '0x05': '20000',
                '0x06': '17500',
                '0x07': '15000',
                '0x08': '15000',
                '0x09': '15000',
                '0x10': '12500',
            });
        });

        it('returns empty object when owners is empty', () => {
            const result = rewardUtils.toRewardJson({
                owners: [],
                totalAmount: BigInt(1000),
            });

            expect(result).toEqual({});
        });
    });
});
