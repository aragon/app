import * as React from 'react';

/**
 * ResourceLink — from @aragon/app@1.39.1 (apps/app/src/shared/components/resourceLink/resourceLink.tsx).
 */
export interface ResourceLinkProps {
  /** Optional custom text for the resource link. */
  name?: string;
  /** Resource URL. */
  url: string;
  id?: string;
  /** Variant of the link. */
  variant?: "primary" | "neutral";
  /** Whether the link is disabled. */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  /** Classnames to be applied directly to the link text. */
  textClassName?: string;
  /** Whether the link is external. If true, the link will open in a new tab and will have external link icon. */
  isExternal?: boolean;
}

import type { CSSProperties } from 'react';

export declare const ResourceLink: React.ComponentType<ResourceLinkProps>;
