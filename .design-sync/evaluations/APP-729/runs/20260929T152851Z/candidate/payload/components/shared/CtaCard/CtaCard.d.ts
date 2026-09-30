import * as React from 'react';

/**
 * CtaCard — from @aragon/app@1.39.1 (apps/app/src/shared/components/ctaCard/ctaCard.tsx).
 */
export interface CtaCardProps {
  /** Illustration object type to render in the card header. */
  objectType: IllustrationObjectType;
  /** Title of the card. */
  title: string;
  /** Description text. */
  description: string;
  /** Whether to use primary variant styling (border + shadow). */
  isPrimary: boolean;
  /** Primary action button configuration. */
  primaryAction: { label: string; href?: string; onClick?: () => void; };
  /** Optional tag label displayed in the top-right corner. */
  tag?: string;
  /** Optional secondary action button (always opens external link). */
  secondaryAction?: { label: string; href: string; };
  /** Text size variant. `normal` uses h1-sized heading and responsive description; `smaller` uses h2-sized heading and base d */
  textSize?: "normal" | "smaller";
  /** Custom class name for the component. */
  className?: string;
}

import type { IllustrationObjectType } from '@aragon/gov-ui-kit';

export declare const CtaCard: React.ComponentType<CtaCardProps>;
