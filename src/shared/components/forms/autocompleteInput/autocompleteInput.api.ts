import type { IconType, IInputTextProps } from '@aragon/gov-ui-kit';

export interface IAutocompleteInputGroup {
    /**
     * ID of the group.
     */
    id: string;
    /**
     * Name of the group.
     */
    name: string;
    /**
     * Additional information of the group.
     */
    info: string;
    /**
     * Array of data strings to be used for indexing the group. The group will be displayed on the result list when one
     * of the string matches the current input search value.
     */
    indexData?: string[];
}

export interface IAutocompleteInputItem {
    /**
     * ID of the item.
     */
    id: string;
    /**
     * Name of the item.
     */
    name: string;
    /**
     * Icon of the item.
     */
    icon: IconType;
    /**
     * ID of the group the item belongs to.
     */
    groupId?: string;
}

export interface IAutocompleteInputItemIndex extends IAutocompleteInputItem {
    /**
     * Index of the element inside the items array.
     */
    index: number;
}

export interface IAutocompleteInputProps extends Omit<IInputTextProps, 'onChange'> {
    /**
     * Items to be rendered.
     */
    items: IAutocompleteInputItem[];
    /**
     * Information about the item groups.
     */
    groups?: IAutocompleteInputGroup[];
    /**
     * ID of the current selected item.
     */
    value?: string;
    /**
     * Callback called with the ID of the item selected.
     */
    onChange?: (value: string) => void;
    /**
     * Callback called on open property change.
     */
    onOpenChange?: (isOpen: boolean) => void;
    /**
     * Label displayed on the menu footer for selecting an item.
     */
    selectItemLabel: string;
}
