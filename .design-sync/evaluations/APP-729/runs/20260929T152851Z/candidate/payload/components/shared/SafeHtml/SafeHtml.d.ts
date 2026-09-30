import * as React from 'react';

/**
 * SafeHtml — from @aragon/app@1.39.1 (apps/app/src/shared/components/SafeHtml.tsx).
 */
export interface SafeHtmlProps {
  /** HTML string to be sanitized and rendered. */
  html: string;
  /** Sanitization variant to use. - `strict`: Removes all HTML tags and attributes, leaving only plain text. - `rich`: Allows */
  variant?: "rich" | "strict";
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

import type { CSSProperties } from 'react';

export declare const SafeHtml: React.ComponentType<SafeHtmlProps>;
