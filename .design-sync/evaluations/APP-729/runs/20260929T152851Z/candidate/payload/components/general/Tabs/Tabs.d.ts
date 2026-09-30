import * as React from 'react';

/**
 * Tabs — from @aragon/gov-ui-kit@2.11.4.
 */
export interface TabsProps {
  [key: string]: unknown;
}

export interface TabsRootProps {
  /** The value of the tab that should be selected by default. */
  defaultValue?: string;
  /** The value of the selected tab. */
  value?: string;
  /** Callback when the value changes. */
  onValueChange?: (value: string) => void;
  /** Whether the Tabs.List should use an underlined style. */
  isUnderlined?: boolean;
}

export interface TabsListProps {
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface TabsTriggerProps {
  /** The label of the tab. */
  label: string;
  /** Value linking Tabs.Trigger to its corresponding Tabs.Content */
  value: string;
  /** The icon to display on the right side of the tab label. */
  iconRight?: unknown;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface TabsContentProps {
  /** Value linking Tabs.Content to its corresponding Tabs.Trigger */
  value: string;
  /** When `true`, the content will stay mounted even when inactive. */
  forceMount?: true;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const Tabs: {
  Root: React.ComponentType<TabsRootProps>;
  List: React.ComponentType<TabsListProps>;
  Trigger: React.ComponentType<TabsTriggerProps>;
  Content: React.ComponentType<TabsContentProps>;
};

