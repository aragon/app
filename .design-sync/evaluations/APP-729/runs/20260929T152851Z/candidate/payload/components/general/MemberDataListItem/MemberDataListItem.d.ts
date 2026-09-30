import * as React from 'react';

/**
 * MemberDataListItem — from @aragon/gov-ui-kit@2.11.4.
 */
export interface MemberDataListItemProps {
  [key: string]: unknown;
}

export interface MemberDataListItemStructureProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
  /** Whether the member is a delegate of current user or not. */
  isDelegate?: boolean;
  /** The number of delegations the member has from other members. */
  delegationCount?: number;
  /** The total amount of tokens. */
  tokenAmount?: string | number;
  /** ENS name of the user. */
  ensName?: string;
  /** 0x address of the user. */
  address: string;
  /** Direct URL src of the user avatar image to be rendered. */
  avatarSrc?: string;
  /** Hide token voting label */
  hideLabelTokenVoting?: boolean;
  /** Token Symbol. */
  tokenSymbol?: string;
}

export interface MemberDataListItemSkeletonProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
}

export declare const MemberDataListItem: React.ComponentType<MemberDataListItemProps> & {
  Structure: React.ComponentType<MemberDataListItemStructureProps>;
  Skeleton: React.ComponentType<MemberDataListItemSkeletonProps>;
};

