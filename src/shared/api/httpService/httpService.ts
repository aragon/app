import type { HttpServiceErrorHandler, IRequestOptions, IRequestParams } from './httpService.api';

export class HttpService {
    private baseUrl: string;
    private errorHandler: HttpServiceErrorHandler | undefined;

    constructor(baseUrl: string, errorHandler?: HttpServiceErrorHandler) {
        this.baseUrl = baseUrl;
        this.errorHandler = errorHandler;
    }

    request = async <TData, TUrlParams = unknown, TQueryParams = unknown, TBody = unknown>(
        url: string,
        params: IRequestParams<TUrlParams, TQueryParams, TBody> = {},
        options?: IRequestOptions,
    ): Promise<TData> => {
        const completeUrl = this.buildUrl(url, params);
        const processedOptions = this.buildOptions(options);

        const isFormData = params.body instanceof FormData;
        const fetchOptions: RequestInit = {
            cache: 'no-store',
            body: isFormData ? (params.body as BodyInit) : JSON.stringify(params.body),
            ...(isFormData ? options : processedOptions),
        };

        const response = await fetch(completeUrl, fetchOptions);

        if (!response.ok) {
            const defaultError = new Error(response.statusText);
            const error = this.errorHandler != null ? await this.errorHandler(response) : defaultError;

            throw error;
        }

        return response.json() as TData;
    };

    private buildUrl = <TUrlParams, TQueryParams, TBody>(
        url: string,
        params: IRequestParams<TUrlParams, TQueryParams, TBody> = {},
    ): string => {
        const { urlParams, queryParams } = params;
        const parsedUrl = this.replaceUrlParams(url, { ...urlParams });
        const parsedParams = this.parseQueryParams({ ...queryParams });
        const fullUrl = `${this.baseUrl}${parsedUrl}`;

        return parsedParams != null ? `${fullUrl}?${parsedParams.toString()}` : fullUrl;
    };

    private buildOptions = (options?: IRequestOptions) => {
        const { method, headers, ...otherOptions } = options ?? {};
        const processedHeaders = method === 'POST' ? { 'Content-type': 'application/json', ...headers } : headers;

        return { method, headers: processedHeaders, ...otherOptions };
    };

    private replaceUrlParams = (url: string, params?: Record<string, string>): string => {
        if (params == null) {
            return url;
        }

        const parsedUrl = Object.keys(params).reduce((current, key) => current.replace(`:${key}`, params[key]), url);

        return parsedUrl;
    };

    private parseQueryParams = (params?: Record<string, unknown>): URLSearchParams | undefined => {
        if (params == null || Object.keys(params).length === 0) {
            return undefined;
        }

        const parsedParams = new URLSearchParams();

        Object.keys(params).forEach((key) => {
            const value = params[key];

            if (typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number') {
                parsedParams.append(key, value.toString());
            } else if (typeof value === 'object') {
                parsedParams.append(key, JSON.stringify(value));
            }
        });

        return parsedParams;
    };
}
