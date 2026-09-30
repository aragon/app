import * as React from 'react';

/**
 * Clipboard — from @aragon/gov-ui-kit@2.11.4.
 */
export interface ClipboardProps {
  /** Text value to be copied to the clipboard. */
  copyValue: string;
  /** Size of the button or avatar. */
  size?: "sm" | "md" | "lg";
  /** Variant of the button. */
  variant?: "button" | "avatar" | "avatar-neutral";
  /** Class name to be applied to the wrapper. */
  className?: string;
  /** Optional children to be rendered next to the clipboard. */
  children?: React.ReactNode;
}

export declare const Clipboard: React.ComponentType<ClipboardProps>;
