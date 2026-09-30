import * as React from 'react';

/**
 * Dialog — from @aragon/gov-ui-kit@2.11.4.
 * @replaces dialog
 */
export interface DialogProps {
  [key: string]: unknown;
}

export interface DialogContentProps {
  /** Optional description of the dialog. Considering using the same prop on `DialogContentHeader` for sticky effect. */
  description?: string;
  /** Removes the default paddings when set to true. */
  noInset?: boolean;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface DialogFooterProps {
  /** Primary action of the dialog. */
  primaryAction?: unknown;
  /** Secondary action of the dialog. */
  secondaryAction?: unknown;
  /** Variant of the dialog footer. */
  variant?: "default" | "wizard";
  /** Displays the primary actions with error variant when set to true. */
  hasError?: boolean;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface DialogHeaderProps {
  /** Title of the dialog displayed on the header and used as the dialog's accessible name. */
  title: string;
  /** Optional description of the dialog. When set here, the description stays sticky with the header and remains visible whil */
  description?: string;
  /** Callback triggered on close button click. The close button is not displayed when the property is not set. */
  onClose?: () => void;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface DialogRootProps {
  /** Children of the component. */
  children?: React.ReactNode;
  /** Additional CSS class names for custom styling of the dialog's content container. */
  containerClassName?: string;
  /** Size of the dialog. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Determines whether interactions with elements outside of the dialog will be disabled. */
  modal?: boolean;
  /** Manages the visibility state of the dialog. */
  open?: boolean;
  /** Additional CSS class names for custom styling of the overlay behind the dialog. */
  overlayClassName?: string;
  /** Handler called when focus moves to the trigger after closing */
  onCloseAutoFocus?: (e: Event) => void;
  /** Handler called when the escape key is pressed while the dialog is opened. Closes the dialog by default. */
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  /** Handler called when an interaction (pointer or focus event) happens outside the bounds of the component */
  onInteractOutside?: (e: Event) => void;
  /** Handler called when focus moves into the component after opening */
  onOpenAutoFocus?: (e: Event) => void;
  /** Callback function invoked when the open state of the dialog changes. */
  onOpenChange?: (open: boolean) => void;
  /** Handler called when a pointer event occurs outside the bounds of the component */
  onPointerDownOutside?: (e: Event) => void;
  /** Keeps the focus inside the Dialog when set to true. */
  useFocusTrap?: boolean;
  /** An accessible and hidden title for the dialog, to be used when implementing a dialog without a Dialog.Header component. */
  hiddenTitle?: string;
  /** An accessible and hidden description for the dialog, to be used when implementing a dialog without a description on the  */
  hiddenDescription?: string;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
}

export declare const Dialog: {
  Content: React.ComponentType<DialogContentProps>;
  Footer: React.ComponentType<DialogFooterProps>;
  Header: React.ComponentType<DialogHeaderProps>;
  Root: React.ComponentType<DialogRootProps>;
};

