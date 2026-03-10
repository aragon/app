/**
 * A single reward entry in the token reward distribution response.
 */
export interface ITokenRewardEntry {
    /**
     * Staker address receiving the reward.
     */
    address: string;
    /**
     * Reward amount in wei.
     */
    amount: string;
}

/**
 * Response from the GET /v2/token/rewards/:pluginAddress/:network endpoint.
 * Array of reward entries where Σ amount === totalAmount from the request.
 */
export type ITokenRewardDistribution = ITokenRewardEntry[];
