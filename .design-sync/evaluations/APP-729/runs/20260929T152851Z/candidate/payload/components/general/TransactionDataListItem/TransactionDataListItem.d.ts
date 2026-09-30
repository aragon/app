import * as React from 'react';

/**
 * TransactionDataListItem — from @aragon/gov-ui-kit@2.11.4.
 */
export interface TransactionDataListItemProps {
  [key: string]: unknown;
}

import type { TransactionStatus } from '@aragon/gov-ui-kit';

export interface TransactionDataListItemStructureProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
  /** The chain ID of the transaction. */
  chainId: number;
  /** The price of the transaction in USD. */
  amountUsd?: string | number;
  /** Whether to hide the value of the transaction (USD price). */
  hideValue?: boolean;
  /** The current status of a blockchain transaction on the network. */
  status?: TransactionStatus.PENDING | TransactionStatus.SUCCESS | TransactionStatus.FAILED;
  /** Date of transaction in ISO format or as a timestamp. */
  date: string | number;
  /** The hash of the transaction. */
  hash?: `0x${string}`;
  /** The symbol of the token (e.g. 'ETH'). */
  tokenSymbol?: string;
  /** The token value in the transaction. */
  tokenAmount?: string | number;
  /** Executor labels are only rendered for `TransactionType.EXECUTION` transactions. */
  label?: string;
  /** Action counts are only rendered for `TransactionType.EXECUTION` transactions. */
  actionCount?: number;
}

export interface TransactionDataListItemSkeletonProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
}

export declare const TransactionDataListItem: React.ComponentType<TransactionDataListItemProps> & {
  Structure: React.ComponentType<TransactionDataListItemStructureProps>;
  Skeleton: React.ComponentType<TransactionDataListItemSkeletonProps>;
};

