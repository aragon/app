import * as React from 'react';

/**
 * Icon — from @aragon/gov-ui-kit@2.11.4.
 */
export interface IconProps {
  /** Icon to be displayed. */
  icon: unknown;
  /** Size of the icon. */
  size?: "sm" | "md" | "lg";
  /** Size of the icon depending on the current breakpoint. */
  responsiveSize?: Partial<Record<Breakpoint, IconSize>>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
}

import type { Breakpoint, IconSize } from '@aragon/gov-ui-kit';

export declare const Icon: React.ComponentType<IconProps>;
