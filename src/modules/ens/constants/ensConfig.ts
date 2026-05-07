import { mainnet } from 'viem/chains';

/** ENS resolution is always performed on mainnet regardless of which chain the DAO is on. */
export const ensChainId = mainnet.id;

/**
 * Cache configuration for ENS data. ENS records (name, avatar, text records) rarely
 * change, but they are still user-controlled profile data. Use a moderate TTL so
 * the UI stays reasonably fresh without spamming RPC calls on list views.
 */
export const ensCache = {
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
export const ensRecordKeys = {
    description: 'description',
    url: 'url',
    twitter: 'com.twitter',
    github: 'com.github',
    email: 'email',
    discord: 'com.discord',
    telegram: 'org.telegram',
} as const;

/** Ordered list of record keys used by `useEnsRecords` to fetch in a single query. */
export const ensProfileKeys = Object.values(ensRecordKeys);

/** ENS text-record key used for the profile avatar URL. */
export const ensAvatarKey = 'avatar' as const;
