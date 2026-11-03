/**
 * Whether the source backing an account could be read for a given resource. Values match the backend response.
 */
export enum WorkspaceCoverageStatus {
    /**
     * The source was read fully.
     */
    AVAILABLE = 'available',
    /**
     * The source holds more than was read, e.g. a Safe queue longer than one page.
     */
    PARTIAL = 'partial',
    /**
     * The address is not an indexed DAO, so rows may exist but the history is not guaranteed to be complete. This
     * is the permanent state of every Safe account, not a failure.
     */
    UNVERIFIED = 'unverified',
    /**
     * The address is neither an indexed DAO nor a Safe on a covered network.
     */
    UNSUPPORTED = 'unsupported',
    /**
     * The source exists but the read failed right now: rate limit, timeout, gateway down.
     */
    UNAVAILABLE = 'unavailable',
}
