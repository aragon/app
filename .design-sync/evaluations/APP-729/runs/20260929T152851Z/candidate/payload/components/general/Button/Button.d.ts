import * as React from 'react';

/**
 * Button — from @aragon/gov-ui-kit@2.11.4.
 * @replaces button
 */
export interface ButtonProps {
  /** Variant of the button. */
  variant?: "warning" | "critical" | "success" | "primary" | "secondary" | "tertiary" | "ghost";
  /** Size of the button. */
  size?: "sm" | "md" | "lg";
  /** Applies responsiveness to the size of the button. */
  responsiveSize?: Partial<Record<Breakpoint, ButtonSize>>;
  /** Icon displayed on the right side of the button. This icon is hidden in case the button has no children element set (only */
  iconRight?: unknown;
  /** Icon displayed on the left side of the button. This icon is displayed in case the button has no children element set (on */
  iconLeft?: unknown;
  /** A boolean indicating whether the button is loading. */
  isLoading?: boolean;
  /** A boolean indicating whether the button is disabled. */
  disabled?: boolean;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  href?: string;
  target?: string & {} | "_self" | "_blank" | "_parent" | "_top";
  download?: any;
  hrefLang?: string;
  media?: string;
  ping?: string;
  referrerPolicy?: "" | "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
}

import type { Breakpoint, ButtonSize } from '@aragon/gov-ui-kit';

export declare const Button: React.ComponentType<ButtonProps>;
