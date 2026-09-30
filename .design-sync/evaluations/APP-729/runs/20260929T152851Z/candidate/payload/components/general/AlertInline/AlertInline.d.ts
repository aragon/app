import * as React from 'react';

/**
 * AlertInline — from @aragon/gov-ui-kit@2.11.4.
 */
export interface AlertInlineProps {
  /** Alert text content. */
  message: string;
  /** Defines the variant of the alert. */
  variant?: "warning" | "critical" | "info" | "success";
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const AlertInline: React.ComponentType<AlertInlineProps>;
