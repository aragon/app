import * as React from 'react';

/**
 * DaoAvatar — from @aragon/gov-ui-kit@2.10.0.
 */
export interface DaoAvatarProps {
  /** Name of the DAO */
  name?: string;
  /** The size of the avatar. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "xs";
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Responsive size attribute for the avatar. */
  responsiveSize?: Partial<Record<Breakpoint, AvatarSize>>;
}

export declare const DaoAvatar: React.ComponentType<DaoAvatarProps>;
