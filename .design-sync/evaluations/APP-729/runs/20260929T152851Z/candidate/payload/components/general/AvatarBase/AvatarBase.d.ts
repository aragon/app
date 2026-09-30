import * as React from 'react';

/**
 * AvatarBase — from @aragon/gov-ui-kit@2.11.4.
 */
export interface AvatarBaseProps {
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
}

export declare const AvatarBase: React.ComponentType<AvatarBaseProps>;
