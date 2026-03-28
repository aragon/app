export const cryptex = {
    id: 'ethereum-sepolia-0x3c5909c6671E012950aE5fFe1578ffe828A53711',
    name: 'cryptex',
};

/**
 * Hardcoded token voting plugin address for the mainnet Cryptex DAO.
 * Used to query the rewards API for governance participation-based distributions.
 */
export const cryptexTokenVotingPluginAddress: `0x${string}` =
    '0x9ddC4a301BE8E755D89eB611E46b7B43873C04ba';

/**
 * Hardcoded voting escrow (veLocker) address shared by Cryptex DAOs.
 */
export const cryptexVotingEscrowAddress: `0x${string}` =
    '0x5F5C5557667676622d115f5C7a91c61d2f3b4fcE';

export const getCryptexVotingEscrowAddress = (): `0x${string}` =>
    cryptexVotingEscrowAddress;
