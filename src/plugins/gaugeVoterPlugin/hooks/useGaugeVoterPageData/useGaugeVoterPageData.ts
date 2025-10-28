import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { useGaugeVoterUserData } from '../useGaugeVoterUserData';
import type {
    IGaugeVote,
    IUseGaugeVoterPageDataParams,
    IUseGaugeVoterPageDataResult,
    IVotingPowerData,
} from './useGaugeVoterPageData.api';

/**
 * Transforms raw BigInt voting power into display-ready format.
 */
const formatVotingPower = (rawValue: bigint, tokenDecimals: number): IVotingPowerData => {
    const decimalValue = formatUnits(rawValue, tokenDecimals);
    const numericValue = Number(decimalValue);

    const formatted = formatterUtils.formatNumber(decimalValue, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    return {
        raw: rawValue,
        formatted: formatted ?? '0',
        value: numericValue,
    };
};

/**
 * Hook that provides view-ready gauge voter data for page components.
 * Transforms raw blockchain BigInt values into formatted strings and calculated percentages.
 */
export const useGaugeVoterPageData = (params: IUseGaugeVoterPageDataParams): IUseGaugeVoterPageDataResult => {
    const {
        pluginAddress,
        network,
        gaugeAddresses,
        gauges,
        epochTotalVotingPower = BigInt(0),
        tokenDecimals = 18,
        enabled = true,
    } = params;

    // Fetch raw blockchain data
    const {
        votingPower: rawVotingPower,
        usedVotingPower: rawUsedVotingPower,
        gaugeVotes: rawGaugeVotes,
        gaugeTotalVotes: rawGaugeTotalVotes,
        isVoting,
        isLoading,
        refetch,
    } = useGaugeVoterUserData({
        pluginAddress,
        network,
        gaugeAddresses,
        enabled,
    });

    // Transform raw data to view-ready format
    const votingPower = formatVotingPower(rawVotingPower, tokenDecimals);
    const usedVotingPower = formatVotingPower(rawUsedVotingPower, tokenDecimals);
    const epochVotingPower = formatVotingPower(epochTotalVotingPower, tokenDecimals);

    // Calculate usage percentage (0-1)
    const usagePercentage = votingPower.value > 0 ? usedVotingPower.value / votingPower.value : 0;

    // User has voted if they've used all their voting power
    const hasVoted = usedVotingPower.value === votingPower.value && votingPower.value > 0;

    // Transform gauge votes to include formatted values with backend → RPC fallback
    const gaugeVotes: IGaugeVote[] = rawGaugeVotes.map((vote, index) => {
        const formattedUserVotes = formatterUtils.formatNumber(formatUnits(vote.userVotes, tokenDecimals), {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        });

        // Get backend data for this gauge
        const backendGauge = gauges.find((g) => g.address === vote.gaugeAddress);
        const backendTotalVotes = backendGauge?.metrics.totalGaugeVotingPower
            ? BigInt(backendGauge.metrics.totalGaugeVotingPower)
            : BigInt(0);

        // Get RPC data for this gauge
        const rpcTotalVotes = rawGaugeTotalVotes[index]?.totalVotes ?? BigInt(0);

        // Fallback: Use backend if available and non-zero, otherwise use RPC
        const totalVotesForGauge = backendTotalVotes > BigInt(0) ? backendTotalVotes : rpcTotalVotes;
        const totalVotesDecimal = formatUnits(totalVotesForGauge, tokenDecimals);
        const formattedTotalVotes = formatterUtils.formatNumber(totalVotesDecimal, {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        });

        return {
            gaugeAddress: vote.gaugeAddress,
            votes: vote.userVotes,
            formattedVotes: formattedUserVotes ?? '0',
            totalVotes: totalVotesForGauge,
            formattedTotalVotes: formattedTotalVotes ?? '0',
            totalVotesValue: Number(totalVotesDecimal),
        };
    });

    // Get addresses of gauges that have votes
    const votedGaugeAddresses = gaugeVotes.filter((v) => v.votes > 0).map((v) => v.gaugeAddress);

    return {
        votingPower,
        usedVotingPower,
        epochVotingPower,
        usagePercentage,
        hasVoted,
        gaugeVotes,
        votedGaugeAddresses,
        isVoting,
        isLoading,
        refetch,
    };
};
