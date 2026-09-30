import * as React from 'react';

/**
 * MemberAvatar — from @aragon/gov-ui-kit@2.10.0.
 */
export interface MemberAvatarProps {
  /** ENS name of the user to lookup avatar src. */
  ensName?: string;
  /** 0x address of the user to look up ENS name and avatar src. */
  address?: string;
  /** Direct URL src of the user avatar image to be rendered. */
  avatarSrc?: string;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** The size of the avatar. */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "xs";
  /** Responsive size attribute for the avatar. */
  responsiveSize?: Partial<Record<Breakpoint, AvatarSize>>;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: Config;
}

export declare const MemberAvatar: React.ComponentType<MemberAvatarProps>;
