class TokenSettingsUtils {
    private percentageDecimals = 4;

    /**
     * Percentage values for token-based DAO settings are stored as values with 4 decimals. The function parses the
     * value set on the blockchain and returns it as percentage value between 0 and 100.
     */
    parsePercentageSetting = (percentage: number) => percentage / 10 ** this.percentageDecimals;
}

export const tokenSettingsUtils = new TokenSettingsUtils();
