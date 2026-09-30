import * as React from 'react';

/**
 * Accordion — from @aragon/gov-ui-kit@2.11.4.
 */
export interface AccordionProps {
  [key: string]: unknown;
}

import type { IAccordionItemHeaderRemoveControl } from '@aragon/gov-ui-kit';

export interface AccordionContainerProps {
  /** Determines whether one or multiple items can be opened at the same time. */
  isMulti: boolean;
  /** The value of the item to expand when initially rendered and type is "single". Use when you do not need to control the st */
  defaultValue?: string | string[];
  /** Array of key values that determines which items are currently expanded. */
  value?: string | string[];
  /** When the current value (open section) changes, this function will be called. */
  onValueChange?: ((value: string[]) => void) | ((value: string) => void);
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface AccordionItemProps {
  /** A unique value of the accordion item which can matched for default open selection from the root container. */
  value: string;
  /** Determines whether the accordion item is disabled. */
  disabled?: boolean;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface AccordionItemHeaderProps {
  /** Remove control to be displayed in edit mode. */
  removeControl?: IAccordionItemHeaderRemoveControl;
  /** The index of the accordion item. */
  index?: number;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface AccordionItemContentProps {
  /** Forces the content to be mounted when set to true. */
  forceMount?: true;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const Accordion: React.ComponentType<AccordionProps> & {
  Container: React.ComponentType<AccordionContainerProps>;
  Item: React.ComponentType<AccordionItemProps>;
  ItemHeader: React.ComponentType<AccordionItemHeaderProps>;
  ItemContent: React.ComponentType<AccordionItemContentProps>;
};

