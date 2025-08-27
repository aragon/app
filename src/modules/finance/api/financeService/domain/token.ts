import type { Network } from '@/shared/api/daoService';

export interface IToken {
    /**
     * Address of the asset.
     */
    address: string;
    /**
     * Network of the asset.
     */
    network: Network;
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
     * Decimals of the asset.
     */
    decimals: number;
    /**
     * Current price in USD.
     */
    priceUsd: string;
    /**
     * Total supply of the token.
     */
    totalSupply: string;
}
