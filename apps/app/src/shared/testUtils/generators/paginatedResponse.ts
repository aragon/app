import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { generatePaginatedResponseMetadata } from './paginatedResponseMetadata';

export const generatePaginatedResponse = <TData>(
    response?: Partial<IPaginatedResponse<TData>>,
): IPaginatedResponse<TData> => ({
    metadata: generatePaginatedResponseMetadata(),
    data: [],
    ...response,
});
