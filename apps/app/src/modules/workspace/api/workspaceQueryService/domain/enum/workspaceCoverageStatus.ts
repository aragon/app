/**
 * Whether the source backing an account could be read for a given resource. Values match the backend response.
 */
export enum WorkspaceCoverageStatus {
    /**
     * The source was read in full.
     */
    AVAILABLE = 'available',
    /**
     * The source holds more than was read, e.g. a Safe queue longer than 50 entries or a governance body with more
     * than 1000 members. Only reported for proposals and members.
     */
    PARTIAL = 'partial',
    /**
     * The address is not an indexed DAO, so rows may exist but their history is not guaranteed to be complete. Only
     * reported for assets and transactions.
     */
    UNVERIFIED = 'unverified',
    /**
     * The address is neither an indexed DAO nor a Safe on a network the Safe service covers.
     */
    UNSUPPORTED = 'unsupported',
    /**
     * The source exists but could not be read right now (rate limit, timeout, gateway down). Transient.
     */
    UNAVAILABLE = 'unavailable',
}
