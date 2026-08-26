/**
 * How long an unused Safe read stays in the query cache.
 *
 * Wider than the 5-minute TanStack default on purpose: navigating away from a proposal and back
 * is a normal governance flow, and at the default every return trip is a cold fetch against a
 * shared, rate-limited API key. Staleness is still governed by `staleTime` and the poll cadence —
 * this only decides how long the entry survives having no observers.
 */
export const safeQueryGcTime = 10 * 60 * 1000;

/**
 * Request header marking a Safe read that must never be served from a cache.
 *
 * The `/api/safe` proxy caches reads in Next's data cache with stale-while-revalidate, so a reader
 * past the window is handed a stale payload *synchronously*. That is fine for display, and fatal
 * for nonce allocation: the nonce is baked into the EIP-712 `safeTxHash` and cannot be changed once
 * signatures exist, so allocating from stale data recreates the colliding-nonce bug.
 *
 * The proxy consumes this header and never forwards it upstream.
 */
export const safeFreshReadHeader = 'x-safe-fresh-read';
