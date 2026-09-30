import * as React from 'react';

/**
 * StatePingAnimation — from @aragon/gov-ui-kit@2.11.4.
 */
export interface StatePingAnimationProps {
  /** Variant of the ping animation */
  variant?: "warning" | "critical" | "info" | "success" | "primary";
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export declare const StatePingAnimation: React.ComponentType<StatePingAnimationProps>;
