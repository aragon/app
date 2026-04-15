import {
    cryptex,
    cryptexTokenVotingPluginAddress,
} from '../cryptexMainnet/constants/cryptexMainnet';
import {
    tokenVotingRewardsTest,
    tokenVotingRewardsTestTokenVotingPluginAddress,
} from '../tokenVotingRewardsTest/tokenVotingRewardsTest';

export const cryptexTokenVotingPluginAddressByDaoId = {
    [cryptex.id]: cryptexTokenVotingPluginAddress,
    [tokenVotingRewardsTest.id]: tokenVotingRewardsTestTokenVotingPluginAddress,
} satisfies Record<string, `0x${string}`>;
