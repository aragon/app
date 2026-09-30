import * as React from 'react';

/**
 * CardCollapsible — from @aragon/gov-ui-kit@2.10.0.
 */
export interface CardCollapsibleProps {
  /** Additional class names to apply to the card. */
  className?: string;
  /** The collapsed height in pixels. CardCollapsible always uses overlay mode (showOverlay=true), which requires pixel-based  */
  collapsedPixels?: number;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
  style?: CSSProperties;
  id?: string;
  children?: React.ReactNode;
  /** Callback function that is called when the collapsible container is toggled. */
  onToggle?: (isOpen: boolean) => void;
  /** Number of text lines used for the gradient overlay height when collapsed. Has effect only when `showOverlay` is true and */
  overlayLines?: number;
  /** Controlled state of the collapsible container. */
  isOpen?: boolean;
  /** Default state of the collapsible container. */
  defaultOpen?: boolean;
  /** The label to display on the trigger button when the collapsible container is closed. */
  buttonLabelClosed?: string;
  /** The label to display on the trigger button when the collapsible container is open. */
  buttonLabelOpened?: string;
}

export declare const CardCollapsible: React.ComponentType<CardCollapsibleProps>;
