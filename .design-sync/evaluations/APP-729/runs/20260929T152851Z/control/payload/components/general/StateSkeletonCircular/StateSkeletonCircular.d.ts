import * as React from 'react';

/**
 * StateSkeletonCircular — from @aragon/gov-ui-kit@2.10.0.
 */
export interface StateSkeletonCircularProps {
  /** Responsive size attribute for the skeleton. */
  responsiveSize?: Partial<Record<Breakpoint, StateSkeletonCircularSize>>;
  /** The size of the skeleton. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}

export declare const StateSkeletonCircular: React.ComponentType<StateSkeletonCircularProps>;
