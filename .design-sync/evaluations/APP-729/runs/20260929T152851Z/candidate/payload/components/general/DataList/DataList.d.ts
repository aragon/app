import * as React from 'react';

/**
 * DataList — from @aragon/gov-ui-kit@2.11.4.
 */
export interface DataListProps {
  [key: string]: unknown;
}

import type { IDataListContainerState, IDataListFilterSortItem } from '@aragon/gov-ui-kit';

export interface DataListRootProps {
  /** Total number of items. */
  itemsCount?: number;
  /** Number to items to render per page. */
  pageSize?: number;
  /** State of the data list component, */
  state?: "loading" | "initialLoading" | "error" | "fetchingNextPage" | "idle" | "filtered";
  /** Callback called on load-more button click. */
  onLoadMore?: () => void;
  /** Label used for the data list status and pagination. */
  entityLabel: string;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface DataListFilterProps {
  /** Placeholder of the search bar. */
  placeholder?: string;
  /** Current value of the search bar. */
  searchValue?: string;
  /** Callback called on search value change. */
  onSearchValueChange: (value?: string) => void;
  /** Active sorting of the data list. */
  activeSort?: string;
  /** Sort items displayed on the sort dropdown. */
  sortItems?: IDataListFilterSortItem[];
  /** Callback called on sort change. */
  onSortChange?: (sort: string) => void;
  /** Callback called on filter button click. The filter button is not displayed when the callback is not defined. */
  onFilterClick?: () => void;
  /** Callback called on reset filters button click. The reset filters button is not displayed when the callback is not define */
  onResetFiltersClick?: () => void;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface DataListContainerProps {
  /** Skeleton element displayed when the DataList container state is set to loading. */
  SkeletonElement?: unknown;
  /** Error state displayed when the data list status is set to error. */
  errorState?: IDataListContainerState;
  /** Empty state displayed the the data list has no elements to render. */
  emptyState?: IDataListContainerState;
  /** Empty state displayed the the data list has no elements to render for the current applied filters. */
  emptyFilteredState?: IDataListContainerState;
  /** Classes applied only when displaying the DataListItem components. To be used to apply custom layouts to the children com */
  layoutClassName?: string;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface DataListItemProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
}

export interface DataListActionItemProps {
  /** Icon rendered inside the circular avatar on the left. */
  icon: unknown;
  /** Visual variant — `primary` for affirmative actions (e.g. add), `neutral` for back/secondary actions. */
  variant: "neutral" | "primary";
  /** Row label rendered next to the avatar. */
  label: string;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface DataListPaginationProps {
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const DataList: {
  Root: React.ComponentType<DataListRootProps>;
  Filter: React.ComponentType<DataListFilterProps>;
  Container: React.ComponentType<DataListContainerProps>;
  Item: React.ComponentType<DataListItemProps>;
  ActionItem: React.ComponentType<DataListActionItemProps>;
  Pagination: React.ComponentType<DataListPaginationProps>;
};

