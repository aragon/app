import * as React from 'react';

/**
 * DefinitionList — from @aragon/gov-ui-kit@2.11.4.
 */
export interface DefinitionListProps {
  [key: string]: unknown;
}

export interface DefinitionListContainerProps {
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface DefinitionListItemProps {
  /** The term to be displayed in the definition list item. */
  term: string;
  /** Renders an icon to copy the defined value on the clipboard when set. For on-chain entity items, it overrides the childre */
  copyValue?: string;
  /** Optional description text for the definition list item. */
  description?: string;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Renders the item as a link with the provided properties when set. */
  link?: unknown;
}

export declare const DefinitionList: React.ComponentType<DefinitionListProps> & {
  Container: React.ComponentType<DefinitionListContainerProps>;
  Item: React.ComponentType<DefinitionListItemProps>;
};

