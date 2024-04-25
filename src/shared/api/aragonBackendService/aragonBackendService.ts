import type { IRequestUrlQueryParams } from './domain';

type IRequestParams<TUrlParams, TQueryParams> = Partial<IRequestUrlQueryParams<TUrlParams, TQueryParams>>;

export class AragonBackendService {
    private baseUrl = process.env.NEXT_PUBLIC_ARAGAGON_BACKEND_URL;

    request = async <TData, TUrlParams = unknown, TQueryParams = unknown>(
        url: string,
        params: IRequestParams<TUrlParams, TQueryParams> = {},
    ): Promise<TData> => {
        const completeUrl = this.buildUrl(url, params);
        const result = await fetch(completeUrl);

        if (!result.ok) {
            throw new Error(result.statusText);
        }

        return result.json();
    };

    private buildUrl = <TUrlParams, TQueryParams>(
        url: string,
        params: IRequestParams<TUrlParams, TQueryParams> = {},
    ): string => {
        const { urlParams, queryParams } = params;
        const parsedUrl = this.replaceUrlParams(url, { ...urlParams });
        const parsedParams = this.parseQueryParams({ ...queryParams });
        const fullUrl = `${this.baseUrl}${parsedUrl}`;

        return parsedParams != null ? `${fullUrl}?${parsedParams.toString()}` : fullUrl;
    };

    private replaceUrlParams = <TUrlParams extends Record<string, string>>(
        url: string,
        params?: TUrlParams,
    ): string => {
        if (params == null) {
            return url;
        }

        const parsedUrl = Object.keys(params).reduce((current, key) => current.replace(`:${key}`, params[key]), url);

        return parsedUrl;
    };

    private parseQueryParams = <TQueryParams extends Record<string, unknown>>(
        params?: TQueryParams,
    ): URLSearchParams | undefined => {
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
