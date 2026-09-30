import * as React from 'react';

/**
 * Page — from @aragon/app@1.39.1 (.design-sync/app-entry.ts).
 */
export interface PageProps {

}

import type { IBreadcrumbsLink, IButtonProps, ITagProps } from '@aragon/gov-ui-kit';
import type { CSSProperties } from 'react';

/** Opaque external type from @tanstack/query-core. */
export type QueryClient = unknown;

export interface IPageHeaderStat {
    /**
     * Value of the stat.
     * @default 0
     */
    value?: number | string | null;
    /**
     * Label displayed under the value.
     */
    label: string;
    /**
     * Optional suffix of the stat displayed beside its value.
     */
    suffix?: string;
}

export interface IPageMainAction {
    /**
     * Label of the action.
     */
    label: string;
    /**
     * Callback called on action click.
     */
    onClick?: () => void;
    /**
     * Link to navigate to on action click.
     */
    href?: string;
    /**
     * Hides the action when set to true.
     */
    hidden?: boolean;
}

export interface IPageMainSectionActionProps
    extends Omit<IButtonProps, 'variant' | 'size' | 'children'> {
    /**
     * Label of the section action.
     */
    label: string;
}

export interface PageContainerProps {
  /** Query Client to share previously fetched data. */
  queryClient?: QueryClient;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

export interface PageHeaderProps {
  /** Optional breadcrumbs for navigation. */
  breadcrumbs?: IBreadcrumbsLink[];
  /** Optional tag displayed on the breadcrumbs component. */
  breadcrumbsTag?: ITagProps;
  /** Title of the page. */
  title?: string;
  /** Description of the page. */
  description?: string;
  /** Statistics displayed on the header. */
  stats?: IPageHeaderStat[];
  /** Optional avatar of the header. */
  avatar?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

export interface PageContentProps {
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

export interface PageMainProps {
  /** Label of the main section of the page, to be used for pages without header. */
  title?: string;
  /** Action displayed beside the title. The action won't be displayed if the title is not defined. */
  action?: IPageMainAction;
  /** Renders a full-width page layout when set to true. */
  fullWidth?: boolean;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

export interface PageAsideProps {
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

export interface PageMainSectionProps {
  /** Set the default spacing between the title and the section content when set to true. */
  inset?: boolean;
  /** Title of the section. */
  title: string;
  /** Description of the section. */
  description?: string;
  /** An icon to display next to the title. */
  icon?: unknown;
  /** Optional action to be displayed beside the section title. */
  action?: IPageMainSectionActionProps;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

export interface PageAsideCardProps {
  /** Title of the card. */
  title: string;
  /** Icon to be displayed on the card. */
  icon?: string;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
  children?: React.ReactNode;
}

export declare const Page: {
  Container: React.ComponentType<PageContainerProps>;
  Header: React.ComponentType<PageHeaderProps>;
  Content: React.ComponentType<PageContentProps>;
  Main: React.ComponentType<PageMainProps>;
  Aside: React.ComponentType<PageAsideProps>;
  MainSection: React.ComponentType<PageMainSectionProps>;
  AsideCard: React.ComponentType<PageAsideCardProps>;
};
