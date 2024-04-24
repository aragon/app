export interface IRequestParams<TUrlParams, TQueryParams> {
    /**
     * Url parameters of the request.
     */
    urlParams?: TUrlParams;
    /**
     * Query parameters of the request.
     */
    queryParams?: TQueryParams;
}
