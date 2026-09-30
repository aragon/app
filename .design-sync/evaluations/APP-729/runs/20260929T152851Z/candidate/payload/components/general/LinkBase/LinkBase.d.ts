import * as React from 'react';

/**
 * LinkBase — from @aragon/gov-ui-kit@2.11.4.
 */
export interface LinkBaseProps {
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
}

export declare const LinkBase: React.ComponentType<LinkBaseProps>;
