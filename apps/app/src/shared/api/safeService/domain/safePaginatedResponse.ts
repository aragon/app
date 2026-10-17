import { isRecord } from './safeDomainUtils';

/**
 * Pagination envelope used by the Safe transaction service. It differs from the Aragon backend
 * envelope (`data` / `metadata`), so it is modelled separately instead of being reused.
 */
export interface ISafePaginatedResponse<TData> {
    /**
     * Total number of results matching the query.
     */
    count: number;
    /**
     * URL of the next page, or null on the last page.
     */
    next: string | null;
    /**
     * URL of the previous page, or null on the first page.
     */
    previous: string | null;
    /**
     * Results of the current page.
     */
    results: TData[];
}

export const isSafePaginatedResponse = <TData>(
    value: unknown,
    isItem: (item: unknown) => item is TData,
): value is ISafePaginatedResponse<TData> =>
    isRecord(value) &&
    typeof value.count === 'number' &&
    Number.isInteger(value.count) &&
    value.count >= 0 &&
    (typeof value.next === 'string' || value.next === null) &&
    (typeof value.previous === 'string' || value.previous === null) &&
    Array.isArray(value.results) &&
    value.results.every(isItem);
