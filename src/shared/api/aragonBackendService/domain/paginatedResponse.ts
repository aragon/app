export interface IPaginatedResponse<TData> {
    /**
     * Describes the page size of the request.
     */
    limit: number;
    /**
     * Describes how many elements have been skipped.
     */
    skip: number;
    /**
     * Data for the current page.
     */
    data: TData[];
    /**
     * Total elements of the requested resource.
     */
    totRecords: number;
}
