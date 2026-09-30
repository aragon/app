import * as React from 'react';

/**
 * Tooltip — from @aragon/gov-ui-kit@2.11.4.
 */
export interface TooltipProps {
  /** Content of the tooltip */
  content: React.ReactNode;
  /** Defines the variant of the tooltip */
  variant?: "warning" | "critical" | "info" | "success" | "neutral";
  /** The open state of the tooltip when it is initially rendered. Use when you do not need to control its open state. */
  defaultOpen?: boolean;
  /** The controlled open state of the tooltip. Must be used in conjunction with `onOpenChange`. */
  open?: boolean;
  /** Event handler called when the open state of the tooltip changes. */
  onOpenChange?: (open: boolean) => void;
  /** The duration from when the mouse enters the trigger until the tooltip opens. */
  delayDuration?: number;
  /** When `true`, hovering the content will keep the tooltip open. */
  disableHoverableContent?: boolean;
  /** Additional class names for the tooltip content. */
  className?: string;
  /** Children elements to trigger the tooltip. */
  children?: React.ReactNode;
  /** When `true`, the tooltip will use children button as a trigger, to avoid a button inside a button. */
  triggerAsChild?: boolean;
}

export declare const Tooltip: React.ComponentType<TooltipProps>;
