import * as React from 'react';

/**
 * AvatarBase — from @aragon/gov-ui-kit@2.10.0.
 */
export interface AvatarBaseProps {
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}

export declare const AvatarBase: React.ComponentType<AvatarBaseProps>;
