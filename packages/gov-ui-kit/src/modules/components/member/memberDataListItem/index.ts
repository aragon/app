import { MemberDataListItemSkeleton } from './memberDataListItemSkeleton';
import { MemberDataListItemStructure } from './memberDataListItemStructure';

/**
 * `DataList.Item` row for a member: `MemberDataListItem.Structure` renders the data, `MemberDataListItem.Skeleton` its
 * loading placeholder.
 */
export const MemberDataListItem = {
    Structure: MemberDataListItemStructure,
    Skeleton: MemberDataListItemSkeleton,
};

export * from './memberDataListItemSkeleton';
export * from './memberDataListItemStructure';
