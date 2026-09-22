import { isRecord } from './safeDomainUtils';

export interface ISafeBalanceToken {
    /**
     * Name of the token.
     */
    name: string;
    /**
     * Symbol of the token.
     */
    symbol: string;
    /**
     * Decimals of the token.
     */
    decimals: number;
    /**
     * URI of the token logo, when known.
     */
    logoUri: string | null;
}

export interface ISafeBalance {
    /**
     * Address of the token, or null for the native currency of the chain.
     */
    tokenAddress: string | null;
    /**
     * Token metadata, or null for the native currency of the chain.
     */
    token: ISafeBalanceToken | null;
    /**
     * Raw balance in the smallest unit of the token, as a decimal string.
     */
    balance: string;
}

const isSafeBalanceToken = (value: unknown): value is ISafeBalanceToken =>
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.symbol === 'string' &&
    typeof value.decimals === 'number' &&
    Number.isInteger(value.decimals) &&
    value.decimals >= 0 &&
    (typeof value.logoUri === 'string' || value.logoUri === null);

export const isSafeBalance = (value: unknown): value is ISafeBalance =>
    isRecord(value) &&
    (typeof value.tokenAddress === 'string' || value.tokenAddress === null) &&
    (isSafeBalanceToken(value.token) || value.token === null) &&
    typeof value.balance === 'string';
