import * as React from 'react';

/**
 * IllustrationObject — from @aragon/gov-ui-kit@2.11.4.
 */
export interface IllustrationObjectProps {
  /** Illustration object to render. */
  object: unknown;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
}

export declare const IllustrationObject: React.ComponentType<IllustrationObjectProps>;
