import * as React from 'react';

/**
 * RadioCard — from @aragon/gov-ui-kit@2.11.4.
 */
export interface RadioCardProps {
  /** Radio label */
  label: string;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  /** Additional children to render when the radio is selected. */
  children?: React.ReactNode;
  /** The value of the radio item. */
  value: string;
  /** Indicates if the radio is disabled. */
  disabled?: boolean;
  /** Radio card avatar image source */
  avatar?: string;
  /** Description */
  description?: string;
  /** Radio card tag */
  tag?: ITagProps;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
}

import type { ITagProps } from '@aragon/gov-ui-kit';

export declare const RadioCard: React.ComponentType<RadioCardProps>;
