import * as React from 'react';

/**
 * AddressOutput — from @aragon/gov-ui-kit@2.11.4.
 */
export interface AddressOutputProps {
  /** Address to display, always the source of truth of the component. The copied and revealed value is this address in its EI */
  address: string;
  /** Display label for the address, e.g. an ENS name, a profile name or the literal `You`. Defaults to the truncated address  */
  label?: string;
  /** Renders the full checksummed address instead of the truncated one. Ignored when `label` is set. */
  showCompleteAddress?: boolean;
  /** URL the label links to, typically a block explorer. A truthy value also marks the address as link-like: a tap navigates  */
  href?: string;
  /** Whether the `href` link is external (opens in a new tab with an arrow icon). Set to false for in-app navigation. */
  isExternal?: boolean;
  /** Renders an inline copy control that copies the full checksummed address. Defaults to `false` when `hasInteractiveAncesto */
  copy?: boolean;
  /** Reveals the full checksummed address on hover, keyboard focus and tap. Keyboard focus and tap fall away when `hasInterac */
  reveal?: boolean;
  /** Set by containers that are themselves interactive, such as a link, a button or a clickable row. The reveal then hangs of */
  hasInteractiveAncestor?: boolean;
  /** Additional class names for the component root. */
  className?: string;
}

export declare const AddressOutput: React.ComponentType<AddressOutputProps>;
