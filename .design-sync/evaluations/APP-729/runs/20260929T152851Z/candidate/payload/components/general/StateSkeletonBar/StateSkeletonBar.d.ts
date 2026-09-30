import * as React from 'react';

/**
 * StateSkeletonBar — from @aragon/gov-ui-kit@2.11.4.
 */
export interface StateSkeletonBarProps {
  /** Responsive size attribute for the skeleton. */
  responsiveSize?: Partial<Record<Breakpoint, StateSkeletonBarSize>>;
  /** The size of the skeleton. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Specifies the width of the skeleton element. Can be provided as a number (interpreted as pixels) or a string with explic */
  width?: string | number | string & {};
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
}

import type { Breakpoint, StateSkeletonBarSize } from '@aragon/gov-ui-kit';

export declare const StateSkeletonBar: React.ComponentType<StateSkeletonBarProps>;
