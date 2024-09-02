import type { IconType } from '@aragon/ods';

export interface IAutocompleteInputItemGroup {
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

export interface IAutocompleteInputProps {
    /**
     * Items to be rendered.
     */
    items: IAutocompleteInputItem[];
    /**
     * Information about the item groups.
     */
    groups?: IAutocompleteInputItemGroup[];
}
