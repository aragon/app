import type { IEpochMetrics } from '../../api/gaugeVoterService/domain';

/**
 * Generates mock epoch metrics data for testing.
 * Note: An epoch IS the voting period, so epoch start = vote start.
 */
export const generateEpochMetrics = (epochMetrics?: Partial<IEpochMetrics>): IEpochMetrics => {
    const now = Math.floor(Date.now() / 1000);
    const oneDay = 86_400; // seconds in a day
    const epochStart = now - oneDay * 2; // Epoch/voting started 2 days ago

    return {
        pluginAddress: '0x9910F6A4e536f90b00b771EeD6B08BAdb5c43717',
        network: 'ethereum-sepolia',
        epochId: '1456',
        totalVotingPower: '1000000',
        enableUpdateVotingPowerHook: true,
        currentEpochStart: epochStart,
        epochVoteStart: epochStart,
        epochVoteEnd: now + oneDay * 5, // Voting/epoch ends in 5 days
        ...epochMetrics,
    };
};
