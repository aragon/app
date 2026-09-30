import * as React from 'react';

/**
 * Spinner — from @aragon/gov-ui-kit@2.11.4.
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
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

import type { Breakpoint, SpinnerSize } from '@aragon/gov-ui-kit';

export declare const Spinner: React.ComponentType<SpinnerProps>;
