import { DropdownContainer } from './dropdownContainer';
import { DropdownGroup } from './dropdownGroup';
import { DropdownItem } from './dropdownItem';

/**
 * Menu built on Radix Dropdown Menu: `Dropdown.Container` renders the trigger and menu, `Dropdown.Group` stacks
 * independent containers, and `Dropdown.Item` renders each entry.
 */
export const Dropdown = {
    Container: DropdownContainer,
    Group: DropdownGroup,
    Item: DropdownItem,
};

export * from './dropdownContainer';
export * from './dropdownGroup';
export * from './dropdownItem';
