/**
 * Pagination envelope used by the Safe transaction service. It differs from the Aragon backend
 * envelope (`data` / `metadata`), so it is modelled separately instead of being reused.
 */
export interface ISafePaginatedResponse<TData> {
    /**
     * Total number of results matching the query.
     */
    count: number;
    /**
     * URL of the next page, or null on the last page.
     */
    next: string | null;
    /**
     * URL of the previous page, or null on the first page.
     */
    previous: string | null;
    /**
     * Results of the current page.
     */
    results: TData[];
}
