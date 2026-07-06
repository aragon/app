export interface IPaginatedResponseMetadata {
    /**
     * The page that has been fetched (1-based indexing).
     */
    page: number;
    /**
     * Defines how many elements are fetched per page.
     */
    pageSize: number;
    /**
     * Total number of pages for the current collection.
     */
    totalPages: number;
    /**
     * Total number of records for the current collection.
     */
    totalRecords: number;
}
