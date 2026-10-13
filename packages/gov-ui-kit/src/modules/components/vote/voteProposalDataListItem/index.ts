import { VoteProposalDataListItemSkeleton } from './voteProposalDataListItemSkeleton';
import { VoteProposalDataListItemStructure } from './voteProposalDataListItemStructure';

/**
 * `DataList.Item` row for a proposal and the user's vote on it: `VoteProposalDataListItem.Structure` renders the data,
 * `VoteProposalDataListItem.Skeleton` its loading placeholder.
 */
export const VoteProposalDataListItem = {
    Structure: VoteProposalDataListItemStructure,
    Skeleton: VoteProposalDataListItemSkeleton,
};

export * from './voteProposalDataListItemSkeleton';
export * from './voteProposalDataListItemStructure';
