import { HttpService, type IRequestQueryParams } from '../httpService';
import { AragonBackendServiceError } from './aragonBackendServiceError';
import type { IPaginatedResponse } from './domain';

export class AragonBackendService extends HttpService {
    constructor() {
        super(AragonBackendService.getBaseUrl(), AragonBackendServiceError.fromResponse);
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

    // Interact directly to the backend service when the request is done on the server side, otherwise proxy
    // the request through the /api/backend NextJs route.
    private static getBaseUrl = (): string => {
        if (typeof window === 'undefined') {
            return process.env.ARAGON_BACKEND_URL!;
        }

        return '/api/backend';
    };
}
