import {
    isRecord,
    isStringArray,
    isUnsignedIntegerString,
} from './safeDomainUtils';

export interface ISafeInfo {
    /**
     * Checksummed address of the Safe.
     */
    address: string;
    /**
     * Next nonce the Safe will execute, represented as a decimal string to preserve uint256
     * precision. A queued transaction is only live when its nonce is at least this value.
     */
    nonce: string;
    /**
     * Number of owner confirmations required to execute a transaction. Read live, never cached
     * across sessions: owners and threshold can change while a transaction is queued.
     */
    threshold: number;
    /**
     * Checksummed addresses of the current Safe owners.
     */
    owners: string[];
    /**
     * Deployed Safe contract version (e.g. `1.4.1`). Safes below `1.4.1` are under the EIP-1271
     * floor, so consumers must read this rather than assuming a version.
     */
    version: string | null;
    /**
     * Addresses of the modules enabled on the Safe.
     */
    modules: string[];
    /**
     * Address of the transaction guard, or null when no guard is set.
     */
    guard: string | null;
}

export const isSafeInfo = (value: unknown): value is ISafeInfo => {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.address === 'string' &&
        isUnsignedIntegerString(value.nonce) &&
        typeof value.threshold === 'number' &&
        Number.isInteger(value.threshold) &&
        value.threshold > 0 &&
        isStringArray(value.owners) &&
        value.threshold <= value.owners.length &&
        (typeof value.version === 'string' || value.version === null) &&
        isStringArray(value.modules) &&
        (typeof value.guard === 'string' || value.guard === null)
    );
};
