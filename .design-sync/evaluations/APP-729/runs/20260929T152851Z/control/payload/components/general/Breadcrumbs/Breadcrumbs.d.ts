import * as React from 'react';

/**
 * Breadcrumbs — from @aragon/gov-ui-kit@2.10.0.
 */
export interface BreadcrumbsProps {
  /** Array of BreadcrumbsLink objects (@see IBreadcrumbsLink). The array indicates depth from the current position to be disp */
  links: IBreadcrumbsLink[];
  /** Optional tag pill to be displayed at the end of the Breadcrumbs for extra info. */
  tag?: ITagProps;
}

export declare const Breadcrumbs: React.ComponentType<BreadcrumbsProps>;
