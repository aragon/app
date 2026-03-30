import {
    cryptex,
    cryptexTokenVotingPluginAddress,
} from '../cryptexMainnet/constants/cryptexMainnet';
import {
    tokenCDTest,
    tokenCDTestTokenVotingPluginAddress,
} from '../tokenCDTest/constants/tokenCDTest';
import {
    tokenRewards,
    tokenRewardsTokenVotingPluginAddress,
} from '../tokenCDTest/constants/tokenRewards';

export const cryptexTokenVotingPluginAddressByDaoId = {
    [cryptex.id]: cryptexTokenVotingPluginAddress,
    [tokenCDTest.id]: tokenCDTestTokenVotingPluginAddress,
    [tokenRewards.id]: tokenRewardsTokenVotingPluginAddress,
} satisfies Record<string, `0x${string}`>;
