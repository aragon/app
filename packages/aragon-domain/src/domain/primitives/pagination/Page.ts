/**
 * A page of items.
 *
 * Note: If new items are added while pages are being read, records may shift between pages,
 * potentially resulting in duplicates or missed items across requests.
 */
export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export function createPage<T>(
  items: T[],
  page: number,
  pageSize: number,
  totalRecords: number,
): Page<T> {
  return {
    items,
    page,
    pageSize,
    totalPages: Math.ceil(totalRecords / pageSize),
    totalRecords,
  };
}
