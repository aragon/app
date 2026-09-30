import * as React from 'react';

/**
 * AddressesInput — from @aragon/app@1.39.1 (apps/app/src/shared/components/forms/addressesInput/index.ts).
 */
export interface AddressesInputProps {

}

import type { IAddressInputResolvedValue } from '@aragon/gov-ui-kit';
import type { CSSProperties } from 'react';

export interface AddressesInputContainerProps {
  /** The prefix of the field in the form. */
  fieldPrefix?: string;
  /** The name of the field in the form. */
  name: string;
  /** Flag to determine if the list can be empty. */
  allowEmptyList?: boolean;
  /** Callback to overwrite the general add button behavior. */
  onAddClick?: () => void;
  /** Whether to show the "Reset all" option in the more actions menu. */
  showResetAllAction?: boolean;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
  /** Label of the input. */
  label?: React.ReactNode;
  /** Help text displayed above the input. */
  helpText?: string;
}

export interface AddressesInputItemProps {
  /** The index of the member. */
  index: number;
  /** Flag indicating if the input should be disabled. */
  disabled?: boolean;
  /** Custom validator function that extends the default validation. */
  customValidator?: (member: IAddressInputResolvedValue) => string | true;
  /** Chain id used to build the explorer link for the address input. */
  chainId?: number;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

export declare const AddressesInput: {
  Container: React.ComponentType<AddressesInputContainerProps>;
  Item: React.ComponentType<AddressesInputItemProps>;
};
