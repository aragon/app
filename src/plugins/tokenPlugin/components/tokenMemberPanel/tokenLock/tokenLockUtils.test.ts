import { Network } from '@/shared/api/daoService';
import { DateTime } from 'luxon';
import type { IMemberLock } from '../../../api/tokenService';
import { DaoTokenVotingMode, type ITokenPluginSettings } from '../../../types';
import { tokenLockUtils } from './tokenLockUtils';

describe('TokenLockUtils', () => {
    const mockSettings: ITokenPluginSettings = {
        pluginAddress: '0xplugin',
        supportThreshold: 5000,
        minParticipation: 2000,
        minDuration: 3600,
        minProposerVotingPower: '0',
        votingMode: DaoTokenVotingMode.STANDARD,
        token: {
            address: '0x123' as `0x${string}`,
            network: Network.ETHEREUM_MAINNET,
            symbol: 'TKN',
            decimals: 18,
            name: 'Token',
            logo: 'logo.png',
            priceUsd: '1',
            totalSupply: '1000000000',
            hasDelegate: false,
            underlying: '0x456' as `0x${string}`,
        },
        votingEscrow: {
            slope: 1e15, // Slope for voting power calculation
            maxTime: 31536000, // 1 year in seconds
            bias: 0,
            minDeposit: (1e18).toString(),
            minLockTime: 86400, // 1 day
            cooldown: 86400,
            feePercent: 5000,
            minFeePercent: 1000,
            minCooldown: 3600,
        },
    };

    describe('getLockStatus', () => {
        it('returns "active" when lockExit status is false/null', () => {
            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000',
                epochStartAt: DateTime.now().toSeconds() - 1000,
                lockExit: {
                    status: false,
                    queuedAt: undefined,
                    minCooldown: undefined,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            expect(tokenLockUtils.getLockStatus(lock)).toBe('active');
        });

        it('returns "available" when current time >= unlockAt', () => {
            const queuedAt = DateTime.now().toSeconds() - 200;
            const minCooldown = 100;

            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000',
                epochStartAt: DateTime.now().toSeconds() - 1000,
                lockExit: {
                    status: true,
                    queuedAt,
                    minCooldown,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            expect(tokenLockUtils.getLockStatus(lock)).toBe('available');
        });

        it('returns "cooldown" when current time < unlockAt', () => {
            const queuedAt = DateTime.now().toSeconds() - 50;
            const minCooldown = 100;

            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000',
                epochStartAt: DateTime.now().toSeconds() - 1000,
                lockExit: {
                    status: true,
                    queuedAt,
                    minCooldown,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            expect(tokenLockUtils.getLockStatus(lock)).toBe('cooldown');
        });

        it('returns "cooldown" when queuedAt or minCooldown is null even if exitDateAt is provided', () => {
            const exitDateAt = DateTime.now().toSeconds() - 100;

            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000',
                epochStartAt: DateTime.now().toSeconds() - 1000,
                lockExit: {
                    status: true,
                    queuedAt: undefined,
                    minCooldown: undefined,
                    exitDateAt,
                },
                nft: {
                    name: 'veToken',
                },
            };

            expect(tokenLockUtils.getLockStatus(lock)).toBe('cooldown');
        });

        it('returns "cooldown" when unlockAt is null', () => {
            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000',
                epochStartAt: DateTime.now().toSeconds() - 1000,
                lockExit: {
                    status: true,
                    queuedAt: undefined,
                    minCooldown: undefined,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            expect(tokenLockUtils.getLockStatus(lock)).toBe('cooldown');
        });
    });

    describe('calculateVotingPower', () => {
        it('calculates voting power with only slope (no bias)', () => {
            const amount = '1000000000000000000'; // 1 token (18 decimals)
            const time = 86400; // 1 day

            const votingPower = tokenLockUtils.calculateVotingPower(amount, time, mockSettings);

            // Formula: (amount * slope * time + amount * bias) / 1e18
            // (1e18 * 1e15 * 86400 + 1e18 * 0) / 1e18 = 86400
            expect(parseFloat(votingPower)).toBeCloseTo(86.4, 1); // 86400 / 1000 = 86.4 (formatted with 18 decimals)
        });

        it('caps time at maxTime', () => {
            const amount = '1000000000000000000'; // 1 token
            const time = mockSettings.votingEscrow!.maxTime + 10000; // Exceeds maxTime

            const votingPower1 = tokenLockUtils.calculateVotingPower(amount, time, mockSettings);
            const votingPower2 = tokenLockUtils.calculateVotingPower(
                amount,
                mockSettings.votingEscrow!.maxTime,
                mockSettings,
            );

            // Should be capped at maxTime
            expect(votingPower1).toBe(votingPower2);
        });

        it('returns zero for zero amount', () => {
            const amount = '0';
            const time = 86400;

            const votingPower = tokenLockUtils.calculateVotingPower(amount, time, mockSettings);

            expect(votingPower).toBe('0');
        });

        it('calculates voting power with bias', () => {
            const settingsWithBias: ITokenPluginSettings = {
                ...mockSettings,
                votingEscrow: {
                    ...mockSettings.votingEscrow!,
                    bias: 1e17, // Add bias
                },
            };

            const amount = '1000000000000000000'; // 1 token
            const time = 86400; // 1 day

            const votingPower = tokenLockUtils.calculateVotingPower(amount, time, settingsWithBias);

            // Formula: (1e18 * 1e15 * 86400 + 1e18 * 1e17) / 1e18
            // = (86400e15 + 100e15) / 1e18 = (86500e15) / 1e18 = 0.0865
            expect(parseFloat(votingPower)).toBeGreaterThan(86.4); // Should be higher with bias
        });
    });

    describe('getLockVotingPower', () => {
        it('returns voting power for active lock', () => {
            const epochStartAt = DateTime.now().toSeconds() - 86400; // 1 day ago
            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000', // 1 token
                epochStartAt,
                lockExit: {
                    status: false,
                    queuedAt: undefined,
                    minCooldown: undefined,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            const votingPower = tokenLockUtils.getLockVotingPower(lock, mockSettings);

            expect(parseFloat(votingPower)).toBeGreaterThan(0);
        });

        it('returns "0" for lock in cooldown status', () => {
            const epochStartAt = DateTime.now().toSeconds() - 86400;
            const queuedAt = DateTime.now().toSeconds() - 50;

            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000',
                epochStartAt,
                lockExit: {
                    status: true,
                    queuedAt,
                    minCooldown: 100,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            const votingPower = tokenLockUtils.getLockVotingPower(lock, mockSettings);

            expect(votingPower).toBe('0');
        });

        it('returns "0" for lock in available status', () => {
            const epochStartAt = DateTime.now().toSeconds() - 86400;
            const queuedAt = DateTime.now().toSeconds() - 200;

            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000',
                epochStartAt,
                lockExit: {
                    status: true,
                    queuedAt,
                    minCooldown: 100,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            const votingPower = tokenLockUtils.getLockVotingPower(lock, mockSettings);

            expect(votingPower).toBe('0');
        });
    });

    describe('getMultiplier', () => {
        it('calculates correct multiplier for active lock', () => {
            const epochStartAt = DateTime.now().toSeconds() - 86400; // 1 day ago
            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000', // 1 token
                epochStartAt,
                lockExit: {
                    status: false,
                    queuedAt: undefined,
                    minCooldown: undefined,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            const multiplier = tokenLockUtils.getMultiplier(lock, mockSettings);

            // Multiplier = votingPower / amount. With current slope settings this is > 1.
            expect(multiplier).toBeGreaterThan(0);
            expect(multiplier).toBeCloseTo(86.4, 1);
        });

        it('returns 0 multiplier for lock not in active status', () => {
            const epochStartAt = DateTime.now().toSeconds() - 86400;
            const queuedAt = DateTime.now().toSeconds() - 200;

            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000',
                epochStartAt,
                lockExit: {
                    status: true,
                    queuedAt,
                    minCooldown: 100,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            const multiplier = tokenLockUtils.getMultiplier(lock, mockSettings);

            expect(multiplier).toBe(0);
        });

        it('increases multiplier with longer lock time', () => {
            const lock1Day: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000',
                epochStartAt: DateTime.now().toSeconds() - 86400, // 1 day
                lockExit: {
                    status: false,
                    queuedAt: undefined,
                    minCooldown: undefined,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            const lock7Days: IMemberLock = {
                ...lock1Day,
                epochStartAt: DateTime.now().toSeconds() - 604800, // 7 days
            };

            const multiplier1Day = tokenLockUtils.getMultiplier(lock1Day, mockSettings);
            const multiplier7Days = tokenLockUtils.getMultiplier(lock7Days, mockSettings);

            expect(multiplier7Days).toBeGreaterThan(multiplier1Day);
        });
    });

    describe('getMinLockTime', () => {
        it('calculates correct minimum lock time', () => {
            const epochStartAt = 1000;
            const lock: IMemberLock = {
                id: '1',
                tokenId: '1',
                amount: '1000000000000000000',
                epochStartAt,
                lockExit: {
                    status: false,
                    queuedAt: undefined,
                    minCooldown: undefined,
                    exitDateAt: null,
                },
                nft: {
                    name: 'veToken',
                },
            };

            const minLockTime = tokenLockUtils.getMinLockTime(lock, mockSettings.votingEscrow!);

            // minLockTime = epochStartAt + minLockTime from settings
            // 1000 + 86400 = 87400
            expect(minLockTime).toBe(87400);
        });
    });
});
