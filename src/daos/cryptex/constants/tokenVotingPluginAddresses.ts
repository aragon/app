import {
    cryptex,
    cryptexTokenVotingPluginAddress,
} from '../cryptexMainnet/constants/cryptexMainnet';

export const cryptexTokenVotingPluginAddressByDaoId = {
    [cryptex.id]: cryptexTokenVotingPluginAddress,
} satisfies Record<string, `0x${string}`>;
