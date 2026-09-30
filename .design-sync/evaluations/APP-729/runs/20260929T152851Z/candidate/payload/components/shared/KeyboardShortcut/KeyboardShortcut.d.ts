import * as React from 'react';

/**
 * KeyboardShortcut — from @aragon/app@1.39.1 (apps/app/src/shared/components/keyboardShortcut/keyboardShortcut.tsx).
 */
export interface KeyboardShortcutProps {
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

import type { CSSProperties } from 'react';

export declare const KeyboardShortcut: React.ComponentType<KeyboardShortcutProps>;
