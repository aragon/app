import * as React from 'react';

/**
 * Tag — from @aragon/gov-ui-kit@2.10.0.
 */
export interface TagProps {
  /** Defines the variant of the tag. */
  variant?: "warning" | "critical" | "info" | "success" | "neutral" | "primary";
  /** Label of the tag. */
  label: string;
  /** Classes for the component. */
  className?: string;
}

export declare const Tag: React.ComponentType<TagProps>;
