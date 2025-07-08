import { InputText } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type ChangeEvent, type FocusEvent, forwardRef, type KeyboardEvent, useState } from 'react';
import type {
    IAutocompleteInputGroup,
    IAutocompleteInputItem,
    IAutocompleteInputItemIndex,
    IAutocompleteInputProps,
} from './autocompleteInput.api';
import { AutocompleteInputGroup } from './autocompleteInputGroup';
import { AutocompleteInputItem } from './autocompleteInputItem';
import { AutocompleteInputMenu } from './autocompleteInputMenu';
import { useAutocompleteProps } from './useAutocompleteProps';

const ungroupedKey = '_ungrouped';

export const AutocompleteInput = forwardRef<HTMLInputElement, IAutocompleteInputProps>((props, ref) => {
    const {
        items,
        groups,
        value,
        onChange,
        wrapperClassName,
        onFocus,
        onKeyDown,
        onOpenChange,
        selectItemLabel,
        ...otherProps
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const updateOpenState = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
    };

    const handleItemSelected = (item: IAutocompleteInputItem) => {
        updateOpenState(false);
        setInputValue('');
        onChange?.(item.id, inputValue);
    };

    const {
        inputProps: autocompleteInputProps,
        floatingMenuProps,
        getMenuItemProps,
        context,
    } = useAutocompleteProps({
        isOpen,
        onOpenChange: updateOpenState,
        activeIndex,
        setActiveIndex,
        inputRef: ref,
    });

    const { onFocus: onInputFocus, onKeyDown: onInputKeyDown, ...otherAutocompleteInputProps } = autocompleteInputProps;

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        setActiveIndex(0);
    };

    const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
        updateOpenState(true);
        onInputFocus?.(event);
        onFocus?.(event);
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        onInputKeyDown!(event);
        onKeyDown?.(event);

        const selectedItem = activeIndex != null ? processedItems[activeIndex] : undefined;

        if (event.key === 'Enter' && selectedItem != null) {
            handleItemSelected(selectedItem);
            event.preventDefault(); // Prevent default submit behaviour on enter press
        }
    };

    const getGroupById = (id?: string): IAutocompleteInputGroup | undefined => groups?.find((group) => group.id === id);

    const filterItem = (item: IAutocompleteInputItem) => {
        const { groupId, name } = item;
        const { name: groupName, info: groupInfo, indexData } = getGroupById(groupId) ?? {};
        const searchStrings = [name, groupName, groupInfo, ...(indexData ?? [])];

        return (
            searchStrings.some((stringValue) => stringValue?.toLowerCase().includes(inputValue.toLowerCase())) ||
            item.alwaysVisible
        );
    };

    const processedItems: IAutocompleteInputItemIndex[] = items
        .filter((item) => !item.hidden)
        .filter(filterItem)
        .sort((itemOne, itemTwo) => (!itemTwo.groupId ? 1 : !itemOne.groupId ? -1 : 0))
        .map((item, index) => ({ ...item, index }));

    const groupedItems = Object.groupBy(processedItems, (item) => item.groupId ?? ungroupedKey);

    const isBottomPlacement = context.placement === 'bottom';

    const inputWrapperClassName = classNames(
        { 'shadow-primary-lg border-primary-400 hover:border-primary-400': isOpen },
        { 'rounded-b-none border-b-0': isOpen && isBottomPlacement },
        { 'rounded-t-none border-t-0 z-10': isOpen && !isBottomPlacement },
        wrapperClassName,
    );

    return (
        <>
            <InputText
                wrapperClassName={inputWrapperClassName}
                autoComplete="off"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleInputKeyDown}
                {...otherAutocompleteInputProps}
                {...otherProps}
            />
            <AutocompleteInputMenu
                isOpen={isOpen}
                context={context}
                selectItemLabel={selectItemLabel}
                {...floatingMenuProps}
            >
                {Object.keys(groupedItems).map((groupId) => (
                    <AutocompleteInputGroup key={groupId} group={getGroupById(groupId)}>
                        {groupedItems[groupId]?.map((item) => (
                            <AutocompleteInputItem
                                key={item.id}
                                isActive={activeIndex === item.index}
                                item={item}
                                // Use onMouseDown instead of onClick to make sure the callback is called before any
                                // onBlur callback which might hide the autocomplete input and prevent the
                                // handleItemSelected callback from being fired
                                {...getMenuItemProps(item.index, { onMouseDown: () => handleItemSelected(item) })}
                            />
                        ))}
                    </AutocompleteInputGroup>
                ))}
            </AutocompleteInputMenu>
        </>
    );
});

AutocompleteInput.displayName = 'AutocompleteInput';
