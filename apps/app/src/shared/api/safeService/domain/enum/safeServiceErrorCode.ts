/**
 * Machine-readable failure reasons returned by the `/api/safe` proxy route and re-thrown by
 * `safeService` as a `SafeServiceError`. Consumers branch on the code instead of on a status
 * number so that "this chain has no Safe transaction service" stays a first-class state rather
 * than an anonymous error.
 */
export enum SafeServiceErrorCode {
    /** The chain has no Safe transaction service (e.g. Citrea, Chiliz) — not a failure. */
    UNSUPPORTED_CHAIN = 'unsupported-chain',
    /** Upstream returned 429: the shared quota is exhausted, retry after the given delay. */
    RATE_LIMITED = 'rate-limited',
    /** The Safe API key is not configured on this deployment. */
    NOT_CONFIGURED = 'not-configured',
    /** The requested Safe or resource does not exist upstream. */
    NOT_FOUND = 'not-found',
    /** Upstream answered with an unexpected status. */
    UPSTREAM_ERROR = 'upstream-error',
    /** Upstream answered with a body we could not parse. */
    INVALID_RESPONSE = 'invalid-response',
    /** The upstream service could not be reached at all. */
    CONNECTION_ERROR = 'connection-error',
}
