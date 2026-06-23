import { HttpService, type IRequestQueryParams } from '../httpService';
import { AragonBackendServiceError } from './aragonBackendServiceError';
import type { IPaginatedResponse } from './domain';

export class AragonBackendService extends HttpService {
    constructor() {
        // Send the request directly to the backend server when the request is done on the server side, otherwise proxy
        // it through the /api/backend NextJs route.
        const baseUrl =
            typeof window === 'undefined'
                ? process.env.ARAGON_BACKEND_URL!
                : '/api/backend';
        super(
            baseUrl,
            AragonBackendServiceError.fromResponse,
            process.env.NEXT_SECRET_ARAGON_BACKEND_API_KEY,
        );
    }

    getNextPageParams = <
        TParams extends IRequestQueryParams<object>,
        TData = unknown,
    >(
        lastPage: IPaginatedResponse<TData> | null,
        _allPages: IPaginatedResponse<TData>[],
        previousParams: TParams,
    ): TParams | undefined => {
        // A page can be null/empty (e.g. a failed or skipped fetch); treat it as the end
        // of the list instead of throwing on `lastPage.metadata`.
        const metadata = lastPage?.metadata;

        if (metadata == null) {
            return;
        }

        const { page, totalPages } = metadata;

        if (page >= totalPages) {
            return;
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
