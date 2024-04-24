export interface IPaginatedRequest {
    /**
     * Defines how many elements should be skipped for the request.
     */
    skip?: number;
    /**
     * Limits the results amount to the defined value.
     */
    limit?: number;
}
