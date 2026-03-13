export const cryptex = {
    id: 'ethereum-mainnet-0xf204245b0B05E9A0780761E326552A569c1D6ceb',
    name: 'cryptex',
};

// TODO: Remove tokenCDTest when mainnet capital distributor is live (APP-558)
export const tokenCDTest = {
    id: 'ethereum-sepolia-0x3c5909c6671E012950aE5fFe1578ffe828A53711',
    name: 'tokenCDTest',
};

/**
 * Hardcoded token voting plugin addresses per DAO ID.
 * Used to query the rewards API for governance participation-based distributions.
 */
export const cryptexTokenVotingPluginAddresses: Record<string, `0x${string}`> =
    {
        [cryptex.id]: '0x17a1688C56087aDe762721180e1cC1E831C73719',
        [tokenCDTest.id]: '0x1652FDd272fEf49B53bd102550DE775519e60b8E',
    };

/**
 * Hardcoded voting escrow (veLocker) address shared by Cryptex DAOs.
 */
export const cryptexVotingEscrowAddress: `0x${string}` =
    '0x2DE5aE18750FBf82821212194D59aCc989469CDd';

export const getCryptexVotingEscrowAddress = (): `0x${string}` =>
    cryptexVotingEscrowAddress;
