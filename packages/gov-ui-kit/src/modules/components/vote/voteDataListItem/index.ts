import { VoteDataListItemSkeleton } from './voteDataListItemSkeleton';
import { VoteDataListItemStructure } from './voteDataListItemStructure';

/**
 * `DataList.Item` row for a voter and their vote: `VoteDataListItem.Structure` renders the data,
 * `VoteDataListItem.Skeleton` its loading placeholder.
 */
export const VoteDataListItem = {
    Structure: VoteDataListItemStructure,
    Skeleton: VoteDataListItemSkeleton,
};

export * from './voteDataListItemSkeleton';
export * from './voteDataListItemStructure';
