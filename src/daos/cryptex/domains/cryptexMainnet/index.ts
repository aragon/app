export const cryptex = {
    id: 'ethereum-mainnet-0xf204245b0B05E9A0780761E326552A569c1D6ceb',
    name: 'cryptex',
};

/**
 * Hardcoded token voting plugin address for the mainnet Cryptex DAO.
 * Used to query the rewards API for governance participation-based distributions.
 */
export const cryptexTokenVotingPluginAddress: `0x${string}` =
    '0x17a1688C56087aDe762721180e1cC1E831C73719';

/**
 * Hardcoded voting escrow (veLocker) address shared by Cryptex DAOs.
 */
export const cryptexVotingEscrowAddress: `0x${string}` =
    '0x2DE5aE18750FBf82821212194D59aCc989469CDd';

export const getCryptexVotingEscrowAddress = (): `0x${string}` =>
    cryptexVotingEscrowAddress;
