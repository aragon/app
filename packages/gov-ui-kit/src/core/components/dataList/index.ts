import { DataListActionItem } from './dataListActionItem';
import { DataListContainer } from './dataListContainer';
import { DataListFilter } from './dataListFilter';
import { DataListItem } from './dataListItem';
import { DataListPagination } from './dataListPagination';
import { DataListRoot } from './dataListRoot';

/**
 * Usage notes:
 *
 * - `DataList.Filter` renders the filter action only when `onFilterClick` is supplied; its reset action
 *   additionally requires `state="filtered"` and `onResetFiltersClick`, while sort controls render from non-empty
 *   `sortItems` even without `onSortChange`.
 * - Pagination is click-driven “load more,” not infinite scroll: the button calls `onLoadMore` for the next page,
 *   and the list displays children only through the current page-size slice.
 */
export const DataList = {
    Root: DataListRoot,
    Filter: DataListFilter,
    Container: DataListContainer,
    Item: DataListItem,
    ActionItem: DataListActionItem,
    Pagination: DataListPagination,
};

export * from './dataListActionItem';
export * from './dataListContainer';
export * from './dataListFilter';
export * from './dataListItem';
export * from './dataListPagination';
export * from './dataListRoot';
