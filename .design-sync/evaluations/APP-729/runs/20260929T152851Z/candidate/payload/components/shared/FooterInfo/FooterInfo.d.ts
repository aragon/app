import * as React from 'react';

/**
 * FooterInfo — from @aragon/app@1.39.1 (apps/app/src/shared/components/footerInfo/footerInfo.tsx).
 */
export interface FooterInfoProps {
  /** The informational text to display. */
  text: string;
  /** Rendering mode: 'panel' (default) or 'dialog'. Controls text alignment — centered in panel, left-aligned in dialog. */
  mode?: "dialog" | "panel";
}

export declare const FooterInfo: React.ComponentType<FooterInfoProps>;
