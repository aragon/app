import * as React from 'react';

/**
 * LinkBase — from @aragon/gov-ui-kit@2.10.0.
 */
export interface LinkBaseProps {
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}

export declare const LinkBase: React.ComponentType<LinkBaseProps>;
