import { mainnet } from 'viem/chains';

/** ENS resolution is always performed on mainnet regardless of which chain the DAO is on. */
export const ENS_CHAIN_ID = mainnet.id;

/**
 * Cache configuration for ENS data. ENS records (name, avatar, text records) rarely
 * change, but they are still user-controlled profile data. Use a moderate TTL so
 * the UI stays reasonably fresh without spamming RPC calls on list views.
 */
export const ENS_CACHE = {
    /** Data is considered fresh for 5 minutes before a background refetch is triggered. */
    staleTime: 5 * 60 * 1000,
    /** Unused cache entries are garbage-collected after 1 hour. */
    gcTime: 60 * 60 * 1000,
} as const;

/**
 * ENS text-record keys fetched for member profiles.
 * To add a new record (e.g. Farcaster) add one entry here and read it from
 * `useEnsRecords` where needed.
 */
export const ENS_RECORD_KEYS = {
    description: 'description',
    url: 'url',
    twitter: 'com.twitter',
    github: 'com.github',
} as const;

/** Ordered list of record keys used by `useEnsRecords` to fetch in a single query. */
export const ENS_PROFILE_KEYS = Object.values(ENS_RECORD_KEYS);
