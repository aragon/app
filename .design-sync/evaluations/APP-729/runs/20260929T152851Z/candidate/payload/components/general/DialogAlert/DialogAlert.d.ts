import * as React from 'react';

/**
 * DialogAlert — from @aragon/gov-ui-kit@2.11.4.
 */
export interface DialogAlertProps {
  [key: string]: unknown;
}

export interface DialogAlertContentProps {
  /** Removes the default paddings when set to true. */
  noInset?: boolean;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface DialogAlertFooterProps {
  /** Action button of the alert dialog. */
  actionButton: unknown;
  /** Secondary button of the alert dialog used for dismissing the dialog or cancelling the action. */
  cancelButton: unknown;
}

export interface DialogAlertHeaderProps {
  /** Title summarizing dialog's content or purpose. */
  title: string;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface DialogAlertRootProps {
  /** Children of the component. */
  children?: React.ReactNode;
  /** Size of the dialog. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional CSS class names for custom styling of the dialog's content container. */
  containerClassName?: string;
  /** Manages the visibility state of the dialog. Should be implemented alongside `onOpenChange` for controlled usage. */
  open?: boolean;
  /** Additional CSS class names for custom styling of the overlay behind the dialog. */
  overlayClassName?: string;
  /** The visual style variant of the dialog. */
  variant?: "warning" | "critical" | "info" | "success";
  /** Callback function invoked when the open state of the dialog changes. */
  onOpenChange?: (open: boolean) => void;
  /** Handler called when focus moves to the trigger after closing the dialog. */
  onCloseAutoFocus?: (e: Event) => void;
  /** Handler called when focus moves to the destructive action after opening the dialog. */
  onOpenAutoFocus?: (e: Event) => void;
  /** Handler called when the escape key is pressed while the dialog is opened. Closes the dialog by default. */
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  /** Keeps the focus inside the Alert Dialog when set to true. */
  useFocusTrap?: boolean;
  /** An accessible and hidden title for the alert dialog, to be used when implementing a dialog without a DialogAlert.Header  */
  hiddenTitle?: string;
  /** An accessible and hidden description for the alert dialog. */
  hiddenDescription?: string;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
}

export declare const DialogAlert: {
  Content: React.ComponentType<DialogAlertContentProps>;
  Footer: React.ComponentType<DialogAlertFooterProps>;
  Header: React.ComponentType<DialogAlertHeaderProps>;
  Root: React.ComponentType<DialogAlertRootProps>;
};

