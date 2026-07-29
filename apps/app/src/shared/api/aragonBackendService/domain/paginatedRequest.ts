export interface IPaginatedRequest {
    /**
     * Defines which page to fetch (1-based indexing).
     */
    page?: number;
    /**
     * Limits the results amount to the defined value.
     */
    pageSize?: number;
}
