import * as React from 'react';

/**
 * TextAreaRichText — from @aragon/gov-ui-kit@2.11.4.
 */
export interface TextAreaRichTextProps {
  /** Current value of the input. */
  value?: string;
  /** Id of the input. */
  id?: string;
  /** Callback called on value change. */
  onChange?: (value: string) => void;
  /** Placeholder of the input. */
  placeholder?: string;
  /** Whether to render the editor on the first render or not. */
  immediatelyRender?: boolean;
  /** Format of the input value, which determines how content is interpreted and returned. Can be serialized HTML, markdown, o */
  valueFormat?: "html" | "text" | "markdown";
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  /** Label of the input. */
  label?: React.ReactNode;
  style?: React.CSSProperties;
  /** Classes for the component. */
  className?: string;
  /** Children of the component. */
  children?: React.ReactNode;
  /** Displays the input as disabled when set to true. */
  disabled?: boolean;
  /** Variant of the input. */
  variant?: "default" | "warning" | "critical";
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
  /** Classes for the input wrapper. */
  wrapperClassName?: string;
  /** Does not render the default input wrapper when set to true, to be used for using the base input container properties (la */
  useCustomWrapper?: boolean;
}

import type { IInputContainerAlert } from '@aragon/gov-ui-kit';

export declare const TextAreaRichText: React.ComponentType<TextAreaRichTextProps>;
