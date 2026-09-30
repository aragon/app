import * as React from 'react';

/**
 * Dropdown — from @aragon/gov-ui-kit@2.11.4.
 * @replaces select
 */
export interface DropdownProps {
  [key: string]: unknown;
}

import type { ButtonSize } from '@aragon/gov-ui-kit';

export interface DropdownContainerProps<Breakpoint extends PropertyKey = any> {
  /** Size of the dropdown trigger. */
  size?: "sm" | "md" | "lg";
  /** Custom dropdown trigger displayed instead of the default button. */
  customTrigger?: React.ReactNode;
  /** Size of the dropdown trigger depending on the current breakpoint. */
  responsiveSize?: Partial<Record<Breakpoint, ButtonSize>>;
  /** Label of the dropdown trigger. */
  label?: string;
  /** Alignment of the dropdown content. */
  align?: unknown;
  /** Hides the dropdown trigger icon when set to true. This property has no effect when the label property is not set or is e */
  hideIcon?: boolean;
  /** Disables the dropdown when set to true. */
  disabled?: boolean;
  /** Whether the dropdown is open by default. */
  defaultOpen?: boolean;
  /** Whether the dropdown is open. */
  open?: boolean;
  /** Callback when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Sets a max width to the dropdown content as the remaining width between the trigger and the boundary edge. */
  constrainContentWidth?: boolean;
  /** Sets a max height to the dropdown content as the remaining height between the trigger and the boundary edge. */
  constrainContentHeight?: boolean;
  /** Additional classnames for the dropdown container (e.g. for setting a max width for the dropdown items). */
  contentClassNames?: string;
  /** Variant of the dropdown. */
  variant?: "warning" | "critical" | "success" | "primary" | "secondary" | "tertiary" | "ghost";
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface DropdownItemProps {
  /** Renders the dropdown item as selected when set to true. */
  selected?: boolean;
  /** Icon displayed beside the item label. Defaults to LinkExternal when the item is a link or to Checkmark when the selected */
  icon?: unknown;
  /** Position of the icon. */
  iconPosition?: "right" | "left";
  /** Link of the dropdown item. */
  href?: string;
  /** Target of the dropdown link. */
  target?: string;
  /** Rel attribute of the dropdown link. */
  rel?: string;
  /** Form id to associate the dropdown item with a form. In this case, the dropdown item will behave as a submit button. */
  formId?: string;
  /** Disables the dropdown item when set to true. */
  disabled?: boolean;
  /** Callback when the dropdown item is selected. */
  onSelect?: (event: Event) => void;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export declare const Dropdown: React.ComponentType<DropdownProps> & {
  Container: React.ComponentType<DropdownContainerProps>;
  Item: React.ComponentType<DropdownItemProps>;
};

