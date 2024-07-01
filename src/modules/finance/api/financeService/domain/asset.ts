import type { IToken } from './token';

export interface IAsset {
    /**
     * Amount of the asset.
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
