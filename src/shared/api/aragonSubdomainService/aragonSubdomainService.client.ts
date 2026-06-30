import type { IPaginatedResponse } from '../aragonBackendService';
import { HttpService, type IRequestQueryParams } from '../httpService';

export class AragonSubdomainServiceClient extends HttpService {
    constructor() {
        const baseUrl = '/api/subdomain';
        super(baseUrl);
    }

    getNextPageParams = <
        TParams extends IRequestQueryParams<object>,
        TData = unknown,
    >(
        lastPage: IPaginatedResponse<TData>,
        _allPages: IPaginatedResponse<TData>[],
        previousParams: TParams,
    ): TParams | undefined => {
        const { page, totalPages } = lastPage.metadata;

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
