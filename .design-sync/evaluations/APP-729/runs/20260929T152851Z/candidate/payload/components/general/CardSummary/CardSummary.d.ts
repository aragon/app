import * as React from 'react';

/**
 * CardSummary — from @aragon/gov-ui-kit@2.11.4.
 */
export interface CardSummaryProps {
  /** Icon displayed on the card. */
  icon: unknown;
  /** Value of the summary. */
  value: string;
  /** Description of the summary. */
  description: string;
  /** Action of the summary. */
  action: ICardSummaryAction;
  /** Renders the action as stacked when set to true. */
  isStacked?: boolean;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

import type { ICardSummaryAction } from '@aragon/gov-ui-kit';

export declare const CardSummary: React.ComponentType<CardSummaryProps>;
