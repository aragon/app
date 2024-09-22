import type { IToken } from './token';

export interface IAsset {
    /**
     * Amount of the asset already parsed with the related token decimals.
     */
    amount: string;
    /**
     * Amount of the asset in USD.
     */
    amountUsd: string;
    /**
     * Token involved in the balance.
     */
    token: IToken;
}
