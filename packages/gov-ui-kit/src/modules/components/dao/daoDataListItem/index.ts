import { DaoDataListItemSkeleton } from './daoDataListItemSkeleton';
import { DaoDataListItemStructure } from './daoDataListItemStructure';

/**
 * `DataList.Item` row for a DAO: `DaoDataListItem.Structure` renders the data, `DaoDataListItem.Skeleton` its loading
 * placeholder.
 */
export const DaoDataListItem = {
    Structure: DaoDataListItemStructure,
    Skeleton: DaoDataListItemSkeleton,
};

export * from './daoDataListItemSkeleton';
export * from './daoDataListItemStructure';
