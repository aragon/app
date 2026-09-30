import * as React from 'react';

/**
 * Avatar — from @aragon/gov-ui-kit@2.11.4.
 */
export interface AvatarProps {
  /** Fallback content to display when the image fails to load or no image is provided. */
  fallback?: React.ReactNode;
  /** Responsive size attribute for the avatar. */
  responsiveSize?: Partial<Record<Breakpoint, AvatarSize>>;
  /** The size of the avatar. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "xs";
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

import type { AvatarSize, Breakpoint } from '@aragon/gov-ui-kit';

export declare const Avatar: React.ComponentType<AvatarProps>;
