import * as React from 'react';

/**
 * AragonLogo — from @aragon/app@1.39.1 (apps/app/src/shared/components/aragonLogo/aragonLogo.tsx).
 */
export interface AragonLogoProps {
  /** Logo color variant */
  variant?: "primary" | "white";
  /** Logo size */
  size?: "sm" | "md" | "lg";
  /** Only the icon will be displayed regardless of breakpoint. */
  iconOnly?: boolean;
  /** Only the icon will be displayed on mobile devices, full logo otherwise. */
  responsiveIconOnly?: boolean;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

import type { CSSProperties } from 'react';

export declare const AragonLogo: React.ComponentType<AragonLogoProps>;
