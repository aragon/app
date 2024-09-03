import { InputText } from '@aragon/ods';
import classNames from 'classnames';
import { type ChangeEvent, type FocusEvent, type KeyboardEvent, useState } from 'react';
import type { IAutocompleteInputGroup, IAutocompleteInputItem, IAutocompleteInputProps } from './autocompleteInput.api';
import { AutocompleteInputGroup } from './autocompleteInputGroup';
import { AutocompleteInputItem } from './autocompleteInputItem';
import { AutocompleteInputMenu } from './autocompleteInputMenu';
import { useAutocompleteProps } from './useAutocompleteProps';

export const AutocompleteInput: React.FC<IAutocompleteInputProps> = (props) => {
    const { items, groups } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const handleItemSelected = (item: IAutocompleteInputItem) => {
        setInputValue(item.name);
        setIsOpen(false);
    };

    const { inputProps, floatingMenuProps, getMenuItemProps, context } = useAutocompleteProps({
        isOpen,
        onOpenChange: setIsOpen,
        activeIndex,
        setActiveIndex,
        onItemSelected: handleItemSelected,
    });

    const { onFocus: onInputFocus, onKeyDown: onInputKeyDown, ...otherInputProps } = inputProps;

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);
        setActiveIndex(value != null ? 0 : null);
    };

    const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
        setIsOpen(true);
        onInputFocus?.(event);
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        onInputKeyDown?.(event);
        if (event.key === 'Enter' && activeIndex != null && items[activeIndex] != null) {
            handleItemSelected(items[activeIndex]);
        }
    };

    const getGroupById = (id?: string): IAutocompleteInputGroup | undefined => groups?.find((group) => group.id === id);

    const filterItem = (item: IAutocompleteInputItem) => {
        const { groupId, name } = item;
        const { name: groupName, info: groupInfo, indexData } = getGroupById(groupId) ?? {};
        const searchStrings = [name, groupName, groupInfo, ...(indexData ?? [])];

        return searchStrings.some((stringValue) => stringValue?.toLowerCase().includes(inputValue.toLowerCase()));
    };

    const isBottomPlacement = context.placement === 'bottom';

    const processedItems = items.filter(filterItem).map((item, index) => ({ ...item, index }));

    const groupedItems = Object.groupBy(processedItems, (item) => item.groupId ?? 'default');

    const inputWrapperClassName = classNames(
        { 'shadow-primary-lg': isOpen },
        { 'rounded-b-none border-b-0': isOpen && isBottomPlacement },
        { 'rounded-t-none border-t-0 z-10': isOpen && !isBottomPlacement },
    );

    return (
        <>
            <InputText
                wrapperClassName={inputWrapperClassName}
                autoComplete="off"
                value={inputValue}
                placeholder="Placeholder"
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleInputKeyDown}
                {...otherInputProps}
            />
            <AutocompleteInputMenu isOpen={isOpen} context={context} {...floatingMenuProps}>
                {Object.keys(groupedItems).map((groupId) => (
                    <AutocompleteInputGroup key={groupId} group={getGroupById(groupId)}>
                        {groupedItems[groupId]?.map((item) => (
                            <AutocompleteInputItem
                                key={item.id}
                                isActive={activeIndex === item.index}
                                item={item}
                                {...getMenuItemProps(item)}
                            />
                        ))}
                    </AutocompleteInputGroup>
                ))}
            </AutocompleteInputMenu>
        </>
    );
};
