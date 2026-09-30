import * as React from 'react';

/**
 * Progress — from @aragon/gov-ui-kit@2.10.0.
 */
export interface ProgressProps {
  /** Size of progress component. */
  size?: "sm" | "md";
  /** Size of the progress depending on the current breakpoint. */
  responsiveSize?: Partial<Record<Breakpoint, ProgressSize>>;
  /** Current progress to be rendered. */
  value: number;
  /** Variant of the progress component. */
  variant?: "critical" | "success" | "neutral" | "primary";
  /** Threshold displayed with an indicator on the progress bar. */
  thresholdIndicator?: number;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

export declare const Progress: React.ComponentType<ProgressProps>;
