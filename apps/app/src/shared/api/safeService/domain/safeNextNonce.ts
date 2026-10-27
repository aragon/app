import { isRecord, isUnsignedIntegerString } from './safeDomainUtils';

/**
 * The nonce a new Safe transaction must occupy.
 *
 * Served by an endpoint that consults no cache, at any layer: the nonce is bound into the EIP-712
 * `safeTxHash` and cannot be changed once signatures exist, so a value from any cache can allocate a
 * nonce another transaction already holds.
 */
export interface ISafeNextNonce {
    /**
     * One past the highest nonce anything queued holds, floored at the live onchain nonce. Decimal
     * string to preserve uint256 precision.
     */
    nextNonce: string;
    /**
     * Live onchain nonce the Safe will execute next, read from chain.
     */
    currentNonce: string;
}

export const isSafeNextNonce = (value: unknown): value is ISafeNextNonce =>
    isRecord(value) &&
    isUnsignedIntegerString(value.nextNonce) &&
    isUnsignedIntegerString(value.currentNonce);
