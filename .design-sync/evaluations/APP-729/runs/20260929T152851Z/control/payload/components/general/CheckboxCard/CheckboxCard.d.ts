import * as React from 'react';

/**
 * CheckboxCard — from @aragon/gov-ui-kit@2.10.0.
 */
export interface CheckboxCardProps {
  /** Label of the checkbox. */
  label: string;
  style?: CSSProperties;
  className?: string;
  /** Id of the checkbox. */
  id?: string;
  /** Additional children to render when the checkbox is checked. */
  children?: React.ReactNode;
  /** Indicates if the checkbox is disabled. */
  disabled?: boolean;
  /** The checked state of the checkbox. */
  checked?: boolean | "indeterminate";
  /** Callback when the checked state changes. */
  onCheckedChange?: (checked: CheckboxState) => void;
  /** Avatar of the checkbox card. */
  avatar?: string;
  /** Description of the checkbox. */
  description?: string;
  /** Optional tag for the checkbox. */
  tag?: ITagProps;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}

export declare const CheckboxCard: React.ComponentType<CheckboxCardProps>;
