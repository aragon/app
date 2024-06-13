export interface IPaginatedResponseMetadata {
    /**
     * Current page that has been fetched.
     */
    currentPage: number;
    /**
     * Total number of pages for the current collection.
     */
    totPages: number;
    /**
     * Total number of records for the current collection.
     */
    totRecords: number;
    /**
     * Number of records being returned.
     */
    limit: number;
    /**
     * Number of records being skipped.
     */
    skip: number;
}
