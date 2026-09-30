import * as React from 'react';

/**
 * VoteProposalDataListItem — from @aragon/gov-ui-kit@2.11.4.
 */
export interface VoteProposalDataListItemProps {
  [key: string]: unknown;
}

export interface VoteProposalDataListItemStructureProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
  /** The ID of proposal. */
  proposalId: string;
  /** The title of the proposal the user voted on. */
  proposalTitle: string;
  /** The vote of the user. */
  voteIndicator: "yes" | "no" | "abstain" | "approve" | "veto";
  /** Additional description for the vote indicator, displayed after the tag. */
  voteIndicatorDescription?: string;
  /** Date of the vote on the proposal in ISO format or as a timestamp */
  date?: string | number;
  /** Defines if the voting is for vetoing the proposal or not. */
  isVeto?: boolean;
}

export interface VoteProposalDataListItemSkeletonProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
}

export declare const VoteProposalDataListItem: React.ComponentType<VoteProposalDataListItemProps> & {
  Structure: React.ComponentType<VoteProposalDataListItemStructureProps>;
  Skeleton: React.ComponentType<VoteProposalDataListItemSkeletonProps>;
};

