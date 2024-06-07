import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';

export const generatePaginatedResponse = <TData>(
    response?: Partial<IPaginatedResponse<TData>>,
): IPaginatedResponse<TData> => ({
    limit: 0,
    skip: 0,
    data: [],
    totRecords: 0,
    ...response,
});
