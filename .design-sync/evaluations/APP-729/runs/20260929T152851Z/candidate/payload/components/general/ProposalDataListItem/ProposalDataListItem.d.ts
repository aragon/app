import * as React from 'react';

/**
 * ProposalDataListItem — from @aragon/gov-ui-kit@2.11.4.
 */
export interface ProposalDataListItemProps {
  [key: string]: unknown;
}

import type { IPublisher } from '@aragon/gov-ui-kit';

export interface ProposalDataListItemSkeletonProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
}

export interface ProposalDataListItemStructureProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: unknown;
  /** Date relative to the proposal status in ISO format or as a timestamp */
  date?: string | number;
  /** Optional tag indicating proposal type */
  tag?: string;
  /** Publisher(s) address (and optional ENS name and profile link) */
  publisher: IPublisher | IPublisher[];
  /** Proposal status */
  status: unknown;
  /** Provides additional context about the current status of a proposal within a multistage voting process. Only displayed wh */
  statusContext?: string;
  /** Proposal description */
  summary: string;
  /** Indicates whether the connected wallet has voted */
  voted?: boolean;
}

export declare const ProposalDataListItem: React.ComponentType<ProposalDataListItemProps> & {
  Skeleton: React.ComponentType<ProposalDataListItemSkeletonProps>;
  Structure: React.ComponentType<ProposalDataListItemStructureProps>;
};

