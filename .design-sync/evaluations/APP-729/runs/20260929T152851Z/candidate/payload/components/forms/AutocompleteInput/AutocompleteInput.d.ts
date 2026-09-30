import * as React from 'react';

/**
 * AutocompleteInput — from @aragon/app@1.39.1 (apps/app/src/shared/components/forms/autocompleteInput/autocompleteInput.tsx).
 */
export interface AutocompleteInputProps {
  /** Items to be rendered. */
  items: IAutocompleteInputItem<undefined>[];
  /** Information about the item groups. */
  groups?: IAutocompleteInputGroup[];
  /** ID of the current selected item. */
  value?: string;
  /** Callback called with the ID of the item selected and the current input value. */
  onChange?: (value: string, inputValue: string) => void;
  /** Callback called on open property change. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Label displayed on the menu footer for selecting an item. */
  selectItemLabel: string;
  children?: React.ReactNode;
  id?: string;
  /** Label of the input. */
  label?: React.ReactNode;
  /** Variant of the input. */
  variant?: "warning" | "default" | "critical";
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Displays the input as disabled when set to true. */
  disabled?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
  /** Displays an input length counter when set. */
  maxLength?: number;
  /** Classes for the component. */
  className?: string;
  /** Classes for the input wrapper. */
  wrapperClassName?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  /** Text to be rendered beside the input field. */
  addon?: string;
  /** Position of the addon element in relation to the input field. */
  addonPosition?: "left" | "right";
  /** Icon to be rendered on the left side of the input field. */
  iconLeft?: unknown;
  /** Icon to be rendered on the right side of the input field. */
  iconRight?: unknown;
  /** Classes for the input element. */
  inputClassName?: string;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
}

import type { IInputContainerAlert, IconType } from '@aragon/gov-ui-kit';
import type { CSSProperties } from 'react';

export interface IAutocompleteInputItem<TMeta = undefined> {
    /**
     * ID of the item.
     */
    id: string;
    /**
     * Name of the item.
     */
    name: string;
    /**
     * Icon of the item.
     */
    icon: IconType;
    /**
     * Optional info to render on the right side of the item.
     */
    info?: string;
    /**
     * ID of the group the item belongs to.
     */
    groupId?: string;
    /**
     * Additional metadata of the item.
     */
    meta?: TMeta;
    /**
     * Hides the item from the autocomplete list when set to true.
     */
    hidden?: boolean;
    /**
     * Always show the item regardless of current input value when set to true.
     */
    alwaysVisible?: boolean;
}

export interface IAutocompleteInputGroup {
    /**
     * ID of the group.
     */
    id: string;
    /**
     * Name of the group.
     */
    name: string;
    /**
     * Additional information of the group.
     */
    info: string;
    /**
     * Array of data strings to be used for indexing the group. The group will be displayed on the result list when one
     * of the string matches the current input search value.
     */
    indexData?: string[];
}

export declare const AutocompleteInput: React.ComponentType<AutocompleteInputProps>;
