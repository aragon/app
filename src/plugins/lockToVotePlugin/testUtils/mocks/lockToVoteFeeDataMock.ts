import type { IUseLockToVoteFeeDataParams, IUseLockToVoteFeeDataReturn } from '../../hooks/useLockToVoteFeeData';
import { lockToVoteFeeUtils } from '../../utils/lockToVoteFeeUtils';
import {
    generateLockToVoteTicket,
    generateLockToVoteTicketWithFixedFee,
    generateLockToVoteTicketWithTieredFees,
} from '../generators/lockToVoteTicket';
import { LOCK_TO_VOTE_TEST_SCENARIOS } from './lockToVoteFeeMocks';

const TOKEN_SCENARIO_OVERRIDES: Partial<Record<number, keyof typeof LOCK_TO_VOTE_TEST_SCENARIOS>> = {
    27: 'DYNAMIC_FEES',
    48: 'TIERED_FEES',
    59: 'FIXED_FEE',
};

const TOKEN_LOCKED_AMOUNT_OVERRIDES: Record<number, bigint> = {
    1: BigInt('280420000000000000000'), // 280.42
    12: BigInt('150000000000000000000'), // 150
    27: BigInt('50000000000000000000'), // 50
    48: BigInt('350000000000000000000'), // 350
    59: BigInt('75000000000000000000'), // 75
};

/**
 * Mock implementation of useLockToVoteFeeData hook for testing without deployed contracts.
 *
 * Enable via environment variable: NEXT_PUBLIC_MOCK_FEE_DATA=true
 *
 * Features:
 * - Generates realistic ticket data based on contract address
 * - Uses tokenId to vary time elapsed (for testing different chart states)
 * - Calculates fees using real lockToVoteFeeUtils
 * - Supports all three fee modes: DYNAMIC, TIERED, FIXED
 */
export const useLockToVoteFeeDataMock = (params: IUseLockToVoteFeeDataParams): IUseLockToVoteFeeDataReturn => {
    const { tokenId, lockManagerAddress, enabled = true } = params;

    // Return empty state if disabled
    if (!enabled) {
        return {
            ticket: undefined,
            feeAmount: BigInt(0),
            canExit: false,
            isCool: false,
            isLoading: false,
            refetch: () => Promise.resolve(undefined),
        };
    }

    // Determine scenario from lock manager address
    const scenarioFromAddress = getMockScenarioFromAddress(lockManagerAddress);
    const tokenIdNum = Number(tokenId);
    const scenario = getScenarioOverride() ?? TOKEN_SCENARIO_OVERRIDES[tokenIdNum] ?? scenarioFromAddress;

    // Generate mock ticket with time variation based on tokenId
    const ticket = generateMockTicket(scenario, tokenId);

    // Calculate current fee using real utils
    const currentTime = Math.floor(Date.now() / 1000);
    const timeElapsed = currentTime - ticket.queuedAt;
    const feePercent = lockToVoteFeeUtils.calculateFeeAtTime({ timeElapsed, ticket });

    // Mock locked amount (280.42 tokens from Figma design)
    const mockLockedAmount = TOKEN_LOCKED_AMOUNT_OVERRIDES[tokenIdNum] ?? BigInt('280420000000000000000'); // default 280.42 * 10^18
    const feeBasisPoints = Math.round((feePercent * lockToVoteFeeUtils.MAX_FEE_PERCENT) / 100);
    const feeAmount = (mockLockedAmount * BigInt(feeBasisPoints)) / BigInt(lockToVoteFeeUtils.MAX_FEE_PERCENT);

    // Determine exit eligibility
    const canExit = timeElapsed >= ticket.minCooldown;
    const isCool = timeElapsed >= ticket.cooldown;

    return {
        ticket,
        feeAmount,
        canExit,
        isCool,
        isLoading: false,
        refetch: () => Promise.resolve(undefined),
    };
};

/**
 * Maps contract addresses to test scenarios.
 * Addresses are defined in MOCK_CONTRACT_ADDRESSES.
 */
const getMockScenarioFromAddress = (address: string): keyof typeof LOCK_TO_VOTE_TEST_SCENARIOS => {
    const addressLower = address.toLowerCase();

    if (addressLower.includes('4444')) {
        return 'DYNAMIC_FEES';
    }

    if (addressLower.includes('8888')) {
        return 'TIERED_FEES';
    }

    if (addressLower.includes('9999')) {
        return 'FIXED_FEE';
    }

    if (addressLower.includes('0000')) {
        return 'NO_FEES';
    }

    // Default to dynamic fees
    return 'DYNAMIC_FEES';
};

const getScenarioOverride = (): keyof typeof LOCK_TO_VOTE_TEST_SCENARIOS | undefined => {
    if (typeof window === 'undefined') {
        return undefined;
    }

    const mockModeParam = new URLSearchParams(window.location.search).get('mockFeeMode');

    if (!mockModeParam) {
        return undefined;
    }

    const normalizedMode = mockModeParam.trim().toLowerCase();
    const overrideMap: Record<string, keyof typeof LOCK_TO_VOTE_TEST_SCENARIOS> = {
        dynamic: 'DYNAMIC_FEES',
        tiered: 'TIERED_FEES',
        fixed: 'FIXED_FEE',
        none: 'NO_FEES',
    };

    return overrideMap[normalizedMode];
};

/**
 * Generates mock ticket data for testing.
 *
 * Uses tokenId to vary the "days elapsed since queuing":
 * - tokenId % 30 = days ago ticket was queued
 * - This allows testing different points in the fee curve
 *
 * Examples:
 * - tokenId: 1  → queued 1 day ago  → near max fee
 * - tokenId: 7  → queued 7 days ago → mid decay
 * - tokenId: 15 → queued 15 days ago → mid decay
 * - tokenId: 29 → queued 29 days ago → near min fee
 */
const generateMockTicket = (scenario: keyof typeof LOCK_TO_VOTE_TEST_SCENARIOS, tokenId: bigint) => {
    const config = LOCK_TO_VOTE_TEST_SCENARIOS[scenario];

    // Use tokenId to vary time elapsed for testing different chart states
    const tokenIdNum = Number(tokenId);
    const daysAgo = tokenIdNum % 30; // 0-29 days
    const queuedAt = Math.floor(Date.now() / 1000) - daysAgo * 86400;

    const baseTicket = {
        holder: '0xUserAddress' as `0x${string}`,
        queuedAt,
        cooldown: config.cooldown,
        minCooldown: config.minCooldown,
        feePercent: config.feePercent,
        minFeePercent: config.minFeePercent,
    };

    switch (scenario) {
        case 'TIERED_FEES':
            return generateLockToVoteTicketWithTieredFees(baseTicket);

        case 'FIXED_FEE':
            return generateLockToVoteTicketWithFixedFee({
                ...baseTicket,
                minFeePercent: baseTicket.feePercent, // Force fixed
            });

        case 'NO_FEES':
            return generateLockToVoteTicket({
                ...baseTicket,
                feePercent: 0,
                minFeePercent: 0,
            });

        case 'DYNAMIC_FEES':
        default:
            return generateLockToVoteTicket(baseTicket);
    }
};
