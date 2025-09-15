import { HttpService, type IRequestOptions, type IRequestParams, type IRequestQueryParams } from '../httpService';
import { AragonBackendServiceError } from './aragonBackendServiceError';
import type { IPaginatedResponse } from './domain';

export class AragonBackendService extends HttpService {
    constructor() {
        // Send the request directly to the backend server when the request is done on the server side, otherwise proxy
        // it through the /api/backend NextJs route.
        const baseUrl = typeof window === 'undefined' ? process.env.ARAGON_BACKEND_URL! : '/api/backend';
        super(baseUrl, AragonBackendServiceError.fromResponse);
    }

    async request<TData, TUrlParams = unknown, TQueryParams = unknown, TBody = unknown>(
        url: string,
        params: IRequestParams<TUrlParams, TQueryParams, TBody> = {},
        options?: IRequestOptions,
    ): Promise<TData> {
        const processedOptions: IRequestOptions | undefined =
            typeof window === 'undefined' && process.env.ARAGON_BACKEND_API_KEY
                ? {
                      ...options,
                      headers: {
                          ...options?.headers,
                          Authorization: `Bearer ${process.env.ARAGON_BACKEND_API_KEY}`,
                      },
                  }
                : options;

        return super.request(url, params, processedOptions);
    }

    getNextPageParams = <TParams extends IRequestQueryParams<object>, TData = unknown>(
        lastPage: IPaginatedResponse<TData>,
        _allPages: Array<IPaginatedResponse<TData>>,
        previousParams: TParams,
    ): TParams | undefined => {
        const { page, totalPages } = lastPage.metadata;

        if (page >= totalPages) {
            return undefined;
        }

        return {
            ...previousParams,
            queryParams: {
                ...previousParams.queryParams,
                page: page + 1,
            },
        };
    };
}
