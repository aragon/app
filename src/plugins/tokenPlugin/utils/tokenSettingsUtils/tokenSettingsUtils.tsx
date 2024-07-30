class TokenSettingsUtils {
    /**
     * Percentage values for token-based DAO settings are stored values between 0 and 10**6 (defined as RATIO_BASE). The
     * function parses the value set on the blockchain and returns it as percentage value between 0 and 100.
     * (see https://github.com/aragon/osx-commons/blob/main/contracts/src/utils/math/Ratio.sol)
     */
    parsePercentageSetting = (percentage: number) => percentage / 10 ** 4;
}

export const tokenSettingsUtils = new TokenSettingsUtils();
