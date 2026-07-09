import type { IPaginatedResponseMetadata } from '@/shared/api/aragonBackendService';

export const generatePaginatedResponseMetadata = (
    metadata?: Partial<IPaginatedResponseMetadata>,
): IPaginatedResponseMetadata => ({
    page: 0,
    pageSize: 20,
    totalRecords: 0,
    totalPages: 0,
    ...metadata,
});
