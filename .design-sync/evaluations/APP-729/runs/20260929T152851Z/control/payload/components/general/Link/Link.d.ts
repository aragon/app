import * as React from 'react';

/**
 * Link — from @aragon/gov-ui-kit@2.10.0.
 * @replaces a
 */
export interface LinkProps {
  /** Variant of the link. */
  variant?: "neutral" | "primary";
  /** Whether the link is disabled. */
  disabled?: boolean;
  /** Optionally show URL as a description below the link text. */
  showUrl?: boolean;
  /** Classnames to be applied directly to the link text. */
  textClassName?: string;
  /** Whether the link is external. If true, the link will open in a new tab and will have external link icon. */
  isExternal?: boolean;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}

export declare const Link: React.ComponentType<LinkProps>;
