import * as React from 'react';

/**
 * Banner — from @aragon/app@1.39.1 (apps/app/src/shared/components/banner/banner.tsx).
 */
export interface BannerProps {
  /** Message of the banner. */
  message: string;
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

export declare const Banner: React.ComponentType<BannerProps>;
