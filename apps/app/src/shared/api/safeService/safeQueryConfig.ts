/**
 * How long an unused Safe read stays in the query cache.
 *
 * Wider than the 5-minute TanStack default on purpose: navigating away from a proposal and back
 * is a normal governance flow, and at the default every return trip is a cold fetch against a
 * shared, rate-limited API key. Staleness is still governed by `staleTime` and the poll cadence —
 * this only decides how long the entry survives having no observers.
 */
export const safeQueryGcTime = 10 * 60 * 1000;
