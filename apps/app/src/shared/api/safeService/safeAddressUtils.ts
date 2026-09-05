import { getAddress } from 'viem';

/**
 * Canonical form of a Safe address: EIP-55 checksummed.
 *
 * The transaction service answers 422 for anything else, so this is the only shape allowed over
 * the wire. It is equally the cache-key identity: two callers naming the same Safe with different
 * casing must resolve to one query key, or the app fetches the same Safe twice and spends twice
 * the rate budget.
 *
 * Lowercasing first normalises an incorrectly-cased address instead of rejecting it — the backend
 * stores some Safe addresses lowercased — so only a malformed address throws.
 */
export const checksumSafeAddress = (address: string) =>
    getAddress(address.toLowerCase());
