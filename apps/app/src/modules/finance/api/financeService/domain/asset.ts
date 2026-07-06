import type { IToken } from './token';

export interface IAsset {
    /**
     * Amount of the asset already parsed with the related token decimals.
     * This field may be missing for some backend responses; when absent, use amountUsd and priceUsd to derive it.
     */
    amount?: string;
    /**
     * Total value in USD for the asset amount (when provided by the backend).
     */
    amountUsd?: string;
    /**
     * Token involved in the balance.
     */
    token: IToken;
}
