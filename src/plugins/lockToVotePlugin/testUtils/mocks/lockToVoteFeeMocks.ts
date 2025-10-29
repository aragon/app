import type { IMemberLock } from '@/plugins/tokenPlugin/api/tokenService';
import type { IBackendApiMock } from '@/shared/types';

/**
 * Mock configurations for testing different fee scenarios in Lock-to-Vote plugin.
 * These scenarios test the three fee modes: DYNAMIC, TIERED, and FIXED.
 */
export const LOCK_TO_VOTE_TEST_SCENARIOS = {
    DYNAMIC_FEES: {
        name: 'Dynamic Fees (5% → 1% over 30 days)',
        feePercent: 500, // 5% max fee
        minFeePercent: 100, // 1% min fee
        cooldown: 2592000, // 30 days in seconds
        minCooldown: 86400, // 1 day in seconds
    },
    TIERED_FEES: {
        name: 'Tiered Fees (3% before day 7, then 1%)',
        feePercent: 300, // 3% early withdrawal fee
        minFeePercent: 100, // 1% normal fee
        cooldown: 2592000, // 30 days total cooldown
        minCooldown: 604800, // 7 days tier breakpoint
    },
    FIXED_FEE: {
        name: 'Fixed Fee (2% always)',
        feePercent: 200, // 2% fixed fee
        minFeePercent: 200, // Same as max (creates fixed fee)
        cooldown: 1296000, // 15 days cooldown
        minCooldown: 0, // No minimum wait
    },
    NO_FEES: {
        name: 'No Fees (instant withdraw after cooldown)',
        feePercent: 0,
        minFeePercent: 0,
        cooldown: 604800, // 7 days cooldown but no fees
        minCooldown: 0,
    },
} as const;

/**
 * Mock contract addresses for different test scenarios.
 * Use these addresses to trigger different fee behaviors in development.
 */
export const MOCK_CONTRACT_ADDRESSES = {
    DYNAMIC_FEES: '0x4444444444444444444444444444444444444444',
    TIERED_FEES: '0x8888888888888888888888888888888888888888',
    FIXED_FEE: '0x9999999999999999999999999999999999999999',
    NO_FEES: '0x0000000000000000000000000000000000000000',
} as const;

const createMockMemberLock = (options: {
    id: string;
    tokenId: number;
    amount: bigint;
    epochOffsetDays: number;
    exitDateOffsetSeconds: number | null;
    inCooldown: boolean;
}): IMemberLock => {
    const now = Math.floor(Date.now() / 1000);

    return {
        id: options.id,
        tokenId: String(options.tokenId),
        epochStartAt: now - options.epochOffsetDays * 86_400,
        amount: options.amount.toString(),
        lockExit: {
            status: options.inCooldown,
            exitDateAt:
                options.exitDateOffsetSeconds != null
                    ? now + options.exitDateOffsetSeconds
                    : options.exitDateOffsetSeconds,
        },
        nft: {
            name: `Lock NFT #${options.tokenId}`,
        },
    };
};

const MOCK_MEMBER_LOCKS: IMemberLock[] = [
    // Active lock still accruing decay
    createMockMemberLock({
        id: 'mock-lock-1',
        tokenId: 1,
        amount: BigInt('280420000000000000000'),
        epochOffsetDays: 5,
        exitDateOffsetSeconds: null,
        inCooldown: false,
    }),
    // Lock currently in cooldown (fee applies)
    createMockMemberLock({
        id: 'mock-lock-2',
        tokenId: 12,
        amount: BigInt('150000000000000000000'),
        epochOffsetDays: 20,
        exitDateOffsetSeconds: 7 * 86_400,
        inCooldown: true,
    }),
    // Lock ready for withdrawal (shows minimal fees)
    createMockMemberLock({
        id: 'mock-lock-3',
        tokenId: 27,
        amount: BigInt('50000000000000000000'),
        epochOffsetDays: 45,
        exitDateOffsetSeconds: -6 * 3_600,
        inCooldown: true,
    }),
    // Available lock with tiered fee scenario
    createMockMemberLock({
        id: 'mock-lock-4',
        tokenId: 48,
        amount: BigInt('350000000000000000000'),
        epochOffsetDays: 60,
        exitDateOffsetSeconds: -2 * 24 * 3_600,
        inCooldown: true,
    }),
    // Available lock with fixed fee scenario
    createMockMemberLock({
        id: 'mock-lock-5',
        tokenId: 59,
        amount: BigInt('75000000000000000000'),
        epochOffsetDays: 75,
        exitDateOffsetSeconds: -14 * 24 * 3_600,
        inCooldown: true,
    }),
];

/**
 * Mock API responses for Lock-to-Vote plugin testing.
 * Injects fee configuration into the Benqi DAO for local development.
 */
export const lockToVotePluginMocks: IBackendApiMock[] = [
    {
        url: /\/v2\/daos\/avalanche-0x89071d0b320f24a138d6FCb7BFaaB01bb1978988$/,
        type: 'merge',
        data: {
            plugins: [
                {
                    address: '0xLockToVotePluginAddress',
                    interfaceType: 'lockToVote',
                    subdomain: 'lock-to-vote',
                    release: '1',
                    build: '1',
                    isProcess: true,
                    isBody: false,
                    isSubPlugin: false,
                    settings: {
                        token: {
                            address: '0xTokenAddress',
                            name: 'Test Token',
                            symbol: 'TEST',
                            decimals: 18,
                            network: 'avalanche',
                        },
                        votingEscrow: {
                            slope: '1000000000000000', // 1e15
                            maxTime: 31536000, // 1 year
                            bias: '1000000000000000000', // 1e18
                            minLockTime: 86400, // 1 day
                        },
                        // Fee configuration - use DYNAMIC_FEES by default
                        feePercent: LOCK_TO_VOTE_TEST_SCENARIOS.DYNAMIC_FEES.feePercent,
                        minFeePercent: LOCK_TO_VOTE_TEST_SCENARIOS.DYNAMIC_FEES.minFeePercent,
                        cooldown: LOCK_TO_VOTE_TEST_SCENARIOS.DYNAMIC_FEES.cooldown,
                        minCooldown: LOCK_TO_VOTE_TEST_SCENARIOS.DYNAMIC_FEES.minCooldown,
                    },
                    votingEscrow: {
                        curveAddress: '0x2222222222222222222222222222222222222222',
                        nftLockAddress: '0x3333333333333333333333333333333333333333',
                        // Use dynamic fees contract address
                        exitQueueAddress: MOCK_CONTRACT_ADDRESSES.DYNAMIC_FEES,
                    },
                    blockTimestamp: Math.floor(Date.now() / 1000),
                    transactionHash: '0xmocktransactionhash',
                    slug: 'L2V',
                    links: [],
                    name: 'Lock to Vote (Mock)',
                    description: 'Lock-to-Vote plugin with dynamic exit queue fees for testing',
                },
            ],
        },
    },
    {
        url: /\/(?:api\/backend\/)?v2\/members\/[^/]+\/locks/,
        type: 'replace',
        data: {
            metadata: {
                page: 1,
                pageSize: MOCK_MEMBER_LOCKS.length,
                totalPages: 1,
                totalRecords: MOCK_MEMBER_LOCKS.length,
            },
            data: MOCK_MEMBER_LOCKS,
        },
    },
];
