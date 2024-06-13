import type { IPaginatedResponseMetadata } from '@/shared/api/aragonBackendService';

export const generatePaginatedResponseMetadata = (
    metadata?: Partial<IPaginatedResponseMetadata>,
): IPaginatedResponseMetadata => ({
    currentPage: 0,
    totPages: 0,
    totRecords: 0,
    skip: 0,
    limit: 20,
    ...metadata,
});
