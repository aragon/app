import type { Hex } from 'viem';

/**
 * TEMPORARY MOCK DATA
 * This file provides mock data for features not yet available from backend/blockchain.
 * Remove this file once real data sources are implemented.
 */

export interface IMockEpochMetrics {
    isVotingPeriod: boolean;
    endTime: number;
    daysLeftToVote: number;
    userVotingPower: number;
    userUsedVotingPower: number;
}

export interface IMockUserGaugeVote {
    gaugeAddress: Hex;
    userVotes: number;
}

/**
 * Mock epoch-level metrics.
 * TODO: Replace with real data from blockchain or backend endpoint when available.
 */
export const getMockEpochMetrics = (): IMockEpochMetrics => {
    return {
        isVotingPeriod: true,
        endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        daysLeftToVote: 7,
        userVotingPower: 28000, // User's total voting power
        userUsedVotingPower: 28000, // User's already used voting power
    };
};

/**
 * Mock user votes per gauge.
 * TODO: Replace with real data from blockchain contract reads when available.
 * This should query the gauge voter contract for user's votes on each gauge.
 */
export const getMockUserGaugeVotes = (gaugeAddresses: Hex[]): IMockUserGaugeVote[] => {
    // Simulate user having voted on first two gauges
    return gaugeAddresses.map((address, index) => ({
        gaugeAddress: address,
        userVotes: index < 2 ? 16000 - index * 4000 : 0, // First gauge: 16000, second: 12000, rest: 0
    }));
};

/**
 * Get user votes for a specific gauge.
 * TODO: Replace with blockchain read from gauge voter contract.
 */
export const getMockUserVotesForGauge = (gaugeAddress: Hex, allGaugeAddresses: Hex[]): number => {
    const votes = getMockUserGaugeVotes(allGaugeAddresses);
    return votes.find((v) => v.gaugeAddress === gaugeAddress)?.userVotes ?? 0;
};

/**
 * Mock rewards data (placeholder for future feature).
 * TODO: Implement when rewards calculation is ready.
 */
export const getMockRewardsData = () => {
    return {
        totalRewards: 420690, // Total rewards in pool
        getUserRewards: (userVotes: number) => {
            // Simple mock calculation - in reality this would be much more complex
            return userVotes > 0 ? Math.floor(userVotes * 0.0075) : 0;
        },
    };
};
