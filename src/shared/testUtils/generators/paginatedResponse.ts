import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { generatePaginatedResponseMetadata } from './paginatedResponseMetadata';

export const generatePaginatedResponse = <TData>(
    response?: Partial<IPaginatedResponse<TData>>,
): IPaginatedResponse<TData> => ({
    ...response,
    data: response?.data ?? [],
    metadata: generatePaginatedResponseMetadata(response?.metadata),
});
