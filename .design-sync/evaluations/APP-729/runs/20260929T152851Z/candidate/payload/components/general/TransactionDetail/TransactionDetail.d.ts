import * as React from 'react';

/**
 * TransactionDetail — from @aragon/gov-ui-kit@2.11.4.
 */
export interface TransactionDetailProps {
  [key: string]: unknown;
}

export interface TransactionDetailRootProps {
  /** Title displayed in the dialog header. Defaults to the localized "Executed" copy. */
  title?: string;
  /** Callback triggered on close-button click. The close button is hidden when the property is not set. */
  onClose?: () => void;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export declare const TransactionDetail: {
  Root: React.ComponentType<TransactionDetailRootProps>;
};

