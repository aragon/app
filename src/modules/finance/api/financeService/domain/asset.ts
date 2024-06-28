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
     * DAO address.
     */
    daoAddress: `0x${string}`;
    /**
     * Network of the asset.
     */
    network: string;
    /**
     * Token involved in the balance.
     */
    token: IToken;
    /**
     * Address of the token.
     */
    tokenAddress: `0x${string}`;
}
