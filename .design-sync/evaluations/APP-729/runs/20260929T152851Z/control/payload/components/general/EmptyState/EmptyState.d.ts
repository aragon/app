import * as React from 'react';

/**
 * EmptyState — from @aragon/gov-ui-kit@2.10.0.
 */
export interface EmptyStateProps {
  humanIllustration?: IIllustrationHumanProps;
  objectIllustration?: IIllustrationObjectProps;
  /** Title of the empty state. */
  heading: string;
  /** Description of the empty state. */
  description?: string;
  /** Renders the state as horitontal when set to false. */
  isStacked?: boolean;
  /** Primary button of the empty state. The primary button is only rendered on the stacked variant. */
  primaryButton?: unknown | Omit<IButtonBaseProps, "children" | "variant" | "size"> & IButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; } & { label: string; };
  /** Secondary button of the empty state. */
  secondaryButton?: unknown | Omit<IButtonBaseProps, "children" | "variant" | "size"> & IButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; } & { label: string; };
  /** Additional class names to be added to the empty state. */
  className?: string;
}

export declare const EmptyState: React.ComponentType<EmptyStateProps>;
