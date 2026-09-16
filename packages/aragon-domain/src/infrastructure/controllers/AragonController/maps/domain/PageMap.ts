/**
 * Pagination metadata of a `PageDTO`.
 */
export interface PageMetadataDTO {
  /**
   * 1-based index of the returned page.
   */
  page: number;

  /**
   * Maximum number of items per page, as requested.
   */
  pageSize: number;

  /**
   * Total number of pages available for the query.
   */
  totalPages: number;

  /**
   * Total number of items across all pages.
   */
  totalRecords: number;
}

/**
 * Generic paginated response DTO — the serialized counterpart of the
 * domain `Page<T>` primitive. Reused by any paginated use-case result.
 */
export interface PageDTO<T> {
  metadata: PageMetadataDTO;
  data: T[];
}
