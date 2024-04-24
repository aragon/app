export interface IRequestUrlParams<TUrlParams> {
    /**
     * Url parameters of the request.
     */
    urlParams: TUrlParams;
}

export interface IRequestQueryParams<TQueryParams> {
    /**
     * Query parameters of the request.
     */
    queryParams: TQueryParams;
}

export interface IRequestUrlQueryParams<TUrlParams, TQueryParams>
    extends IRequestUrlParams<TUrlParams>,
        IRequestQueryParams<TQueryParams> {}
