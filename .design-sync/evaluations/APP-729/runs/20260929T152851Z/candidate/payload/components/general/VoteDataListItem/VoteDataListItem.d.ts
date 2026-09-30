import * as React from 'react';

/**
 * VoteDataListItem — from @aragon/gov-ui-kit@2.11.4.
 */
export interface VoteDataListItemProps {
  [key: string]: unknown;
}

import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export interface VoteDataListItemStructureProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
  /** The account details of the voter. */
  voter: ICompositeAddress;
  /** Whether the voter is a delegate of the current user or not. */
  isDelegate?: boolean;
  /** The vote of the user. */
  voteIndicator: "yes" | "no" | "abstain" | "approve" | "veto";
  /** Additional description for the vote indicator, displayed after the tag. */
  voteIndicatorDescription?: string;
  /** If token-based voting, the amount of token voting power used. */
  votingPower?: string | number;
  /** If token-based voting, the symbol of the voting power used. */
  tokenSymbol?: string;
  /** Defines if the voting is for vetoing the proposal or not. */
  isVeto?: boolean;
}

export interface VoteDataListItemSkeletonProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
}

export declare const VoteDataListItem: React.ComponentType<VoteDataListItemProps> & {
  Structure: React.ComponentType<VoteDataListItemStructureProps>;
  Skeleton: React.ComponentType<VoteDataListItemSkeletonProps>;
};

