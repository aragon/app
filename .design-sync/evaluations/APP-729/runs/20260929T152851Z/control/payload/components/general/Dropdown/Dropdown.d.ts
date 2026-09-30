import * as React from 'react';

/**
 * Dropdown — from @aragon/gov-ui-kit@2.10.0.
 * @replaces select
 */
export interface DropdownProps {
  [key: string]: unknown;
}

export declare const Dropdown: React.ComponentType<DropdownProps> & {
  Container: React.ComponentType<any>;
  Item: React.ComponentType<any>;
};
