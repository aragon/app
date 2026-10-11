import { AssetDataListItemSkeleton } from './assetDataListItemSkeleton';
import { AssetDataListItemStructure } from './assetDataListItemStructure';

/**
 * `DataList.Item` row for an asset: `AssetDataListItem.Structure` renders the data, `AssetDataListItem.Skeleton` its
 * loading placeholder.
 */
export const AssetDataListItem = {
    Structure: AssetDataListItemStructure,
    Skeleton: AssetDataListItemSkeleton,
};

export * from './assetDataListItemSkeleton';
export * from './assetDataListItemStructure';
