import * as React from 'react';

/**
 * SafeDocumentParser — from @aragon/app@1.39.1 (apps/app/src/shared/components/SafeDocumentParser.tsx).
 */
export interface SafeDocumentParserProps {
  /** The stringified document of Markdown or HTML to parse into a styled output. */
  document: string;
  /** Whether to render the editor on the first render or not. */
  immediatelyRender?: boolean;
  children?: React.ReactNode;
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
}

import type { CSSProperties } from 'react';

export declare const SafeDocumentParser: React.ComponentType<SafeDocumentParserProps>;
