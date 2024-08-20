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

export interface IRequestBodyParams<TBody> {
    /**
     * Body of the request.
     */
    body: TBody;
}

export interface IRequestUrlQueryParams<TUrlParams, TQueryParams>
    extends IRequestUrlParams<TUrlParams>,
        IRequestQueryParams<TQueryParams> {}

export interface IRequestUrlBodyParams<TUrlParams, TBody>
    extends IRequestUrlParams<TUrlParams>,
        IRequestBodyParams<TBody> {}

export interface IRequestQueryBodyParams<TQueryParams, TBody>
    extends IRequestQueryParams<TQueryParams>,
        IRequestBodyParams<TBody> {}

export interface IRequestUrlQueryBodyParams<TUrlParams, TQueryParams, TBody>
    extends IRequestUrlParams<TUrlParams>,
        IRequestQueryParams<TQueryParams>,
        IRequestBodyParams<TBody> {}

export type IRequestParams<TUrlParams, TQueryParams, TBody> = Partial<
    IRequestUrlQueryBodyParams<TUrlParams, TQueryParams, TBody>
>;

export interface IRequestOptions extends Omit<RequestInit, 'cache' | 'body'> {}

export type HttpServiceErrorHandler = (response: Response) => Promise<Error>;
