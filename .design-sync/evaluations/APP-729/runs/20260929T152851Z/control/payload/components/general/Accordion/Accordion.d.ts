import * as React from 'react';

/**
 * Accordion — from @aragon/gov-ui-kit@2.10.0.
 */
export interface AccordionProps {
  [key: string]: unknown;
}

export declare const Accordion: React.ComponentType<AccordionProps> & {
  Container: React.ComponentType<any>;
  Item: React.ComponentType<any>;
  ItemHeader: React.ComponentType<any>;
  ItemContent: React.ComponentType<any>;
};
