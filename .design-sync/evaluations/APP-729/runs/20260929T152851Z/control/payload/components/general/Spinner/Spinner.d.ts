import * as React from 'react';

/**
 * Spinner — from @aragon/gov-ui-kit@2.10.0.
 */
export interface SpinnerProps {
  /** Size of the spinner. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Size of the spinner depending on the current breakpoint. */
  responsiveSize?: Partial<Record<Breakpoint, SpinnerSize>>;
  /** Variant of the spinner. */
  variant?: "warning" | "critical" | "success" | "neutral" | "primary" | "primaryInverted";
  /** Defines if the spinner is in the loading state or not. */
  isLoading?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

export declare const Spinner: React.ComponentType<SpinnerProps>;
