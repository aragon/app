import * as React from 'react';

/**
 * DocumentParser — from @aragon/gov-ui-kit@2.11.4.
 */
export interface DocumentParserProps {
  /** The stringified document of Markdown or HTML to parse into a styled output. */
  document: string;
  /** Whether to render the editor on the first render or not. */
  immediatelyRender?: boolean;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export declare const DocumentParser: React.ComponentType<DocumentParserProps>;
