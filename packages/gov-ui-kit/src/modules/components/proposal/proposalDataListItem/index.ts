import { ProposalDataListItemSkeleton } from './proposalDataListItemSkeleton';
import { ProposalDataListItemStructure } from './proposalDataListItemStructure';

/**
 * Usage notes:
 *
 * - Status tags map `ACTIVE`, `ADVANCEABLE`, and `EXECUTABLE` to `info`; `ACCEPTED` and `EXECUTED` to `success`;
 *   `FAILED`, `EXPIRED`, `REJECTED`, and `VETOED` to `critical`; and `DRAFT`, `PENDING`, and `UNREACHED` to
 *   `neutral`.
 * - `statusContext` is shown only for `ACTIVE` and `ADVANCEABLE`; metadata is hidden for `DRAFT`.
 */
export const ProposalDataListItem = {
    Skeleton: ProposalDataListItemSkeleton,
    Structure: ProposalDataListItemStructure,
};

export * from './proposalDataListItemSkeleton';
export * from './proposalDataListItemStructure';
