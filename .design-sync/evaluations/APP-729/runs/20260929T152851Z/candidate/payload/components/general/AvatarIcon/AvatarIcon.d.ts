import * as React from 'react';

/**
 * AvatarIcon — from @aragon/gov-ui-kit@2.11.4.
 */
export interface AvatarIconProps {
  /** The icon type. */
  icon: unknown;
  /** Responsive size attribute for the avatar. */
  responsiveSize?: Partial<Record<Breakpoint, AvatarIconSize>>;
  /** The size of the avatar icon. */
  size?: "sm" | "md" | "lg";
  /** The variant of the avatar. */
  variant?: "warning" | "critical" | "info" | "success" | "neutral" | "primary";
  /** Renders the icon on a white background. This property overrides the variant default background. */
  backgroundWhite?: boolean;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

import type { AvatarIconSize, Breakpoint } from '@aragon/gov-ui-kit';

export declare const AvatarIcon: React.ComponentType<AvatarIconProps>;
