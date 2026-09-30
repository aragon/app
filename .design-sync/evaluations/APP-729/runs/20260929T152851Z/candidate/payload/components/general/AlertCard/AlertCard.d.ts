import * as React from 'react';

/**
 * AlertCard — from @aragon/gov-ui-kit@2.11.4.
 */
export interface AlertCardProps {
  /** The alert message. */
  message: string;
  /** Variant of the alert. */
  variant?: "warning" | "critical" | "info" | "success";
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const AlertCard: React.ComponentType<AlertCardProps>;
