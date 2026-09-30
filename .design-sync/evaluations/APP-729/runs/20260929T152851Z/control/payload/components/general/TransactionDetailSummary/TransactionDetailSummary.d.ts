import * as React from 'react';

/**
 * TransactionDetailSummary — from @aragon/gov-ui-kit@2.10.0.
 */
export interface TransactionDetailSummaryProps {
  /** Chain ID of the transaction, used to build the block-explorer links. */
  chainId: number;
  /** Entity that executed the transaction, rendered on the `Executed by` row. */
  executedBy: ITransactionDetailSummaryExecutedBy;
  /** Identifier of the proposal that triggered the execution (e.g. 'CRE-54'). The row is omitted when not set. */
  proposalId?: string;
  /** Internal link applied to the proposal identifier (e.g. the proposal detail page). */
  proposalHref?: string;
  /** Total number of actions bundled in the execution. */
  totalActions: number;
  /** Hash of the execution transaction. Rendered truncated with an explorer link and a copy button. */
  transactionHash: `0x${string}`;
  /** Date of the execution in ISO format or as a timestamp. */
  date: string | number;
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export declare const TransactionDetailSummary: React.ComponentType<TransactionDetailSummaryProps>;
