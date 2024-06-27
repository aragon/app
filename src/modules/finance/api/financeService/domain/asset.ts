export interface IAsset {
    /**
     * Address of the asset.
     */
    address: string;
    /**
     * Network of the asset.
     */
    network: string;
    /**
     * Symbol of the asset.
     */
    symbol: string;
    /**
     * Name of the asset.
     */
    name: string;
    /**
     * Logo url.
     */
    logo: string;
    /**
     * Type of the asset.
     */
    type: string;
    /**
     * Decimals of the asset.
     */
    decimals: number;
    /**
     * Price change in the last 24 hours.
     */
    priceChangeOnDayUsd: string;
    /**
     * Current price in USD.
     */
    priceUsd: string;
}
