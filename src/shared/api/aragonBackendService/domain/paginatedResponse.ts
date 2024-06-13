import type { IPaginatedResponseMetadata } from './paginatedResponseMetadata';

export interface IPaginatedResponse<TData> {
    /**
     * Response metadata.
     */
    metadata: IPaginatedResponseMetadata;
    /**
     * Data for the current page.
     */
    data: TData[];
}
