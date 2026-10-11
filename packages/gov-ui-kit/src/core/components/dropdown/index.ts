import { DropdownContainer } from './dropdownContainer';
import { DropdownItem } from './dropdownItem';

/**
 * Menu built on Radix Dropdown Menu: `Dropdown.Container` renders the trigger and menu, `Dropdown.Item` each entry.
 */
export const Dropdown = {
    Container: DropdownContainer,
    Item: DropdownItem,
};

export * from './dropdownContainer';
export * from './dropdownItem';
