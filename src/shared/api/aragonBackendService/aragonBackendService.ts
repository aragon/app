import { HttpService, type IRequestQueryParams } from '../httpService';
import { AragonBackendServiceError } from './aragonBackendServiceError';
import type { IPaginatedResponse } from './domain';

export class AragonBackendService extends HttpService {
    constructor() {
        super(process.env.NEXT_PUBLIC_ARAGAGON_BACKEND_URL!, AragonBackendServiceError.fromResponse);
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
