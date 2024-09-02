import { InputText } from '@aragon/ods';
import {
    autoUpdate,
    flip,
    FloatingFocusManager,
    FloatingPortal,
    MiddlewareState,
    size,
    useDismiss,
    useFloating,
    useInteractions,
    useListNavigation,
    useRole,
} from '@floating-ui/react';
import classNames from 'classnames';
import { KeyboardEvent, useRef, useState } from 'react';
import { KeyboardShortcut } from '../../keyboardShortcut';
import type { IAutocompleteInputItem, IAutocompleteInputProps } from './autocompleteInput.api';
import { AutocompleteInputGroup } from './autocompleteInputGroup';
import { AutocompleteInputItem } from './autocompleteInputItem';

export const AutocompleteInput: React.FC<IAutocompleteInputProps> = (props) => {
    const { items, groups } = props;

    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const listRef = useRef<Array<HTMLElement | null>>([]);

    const updateFloatingStyle = (params: MiddlewareState & { availableHeight: number }) => {
        const { rects, elements } = params;

        const newStyle = {
            width: `${rects.reference.width + 2}px`,
        };

        Object.assign(elements.floating.style, newStyle);
    };

    const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
        whileElementsMounted: autoUpdate,
        open,
        onOpenChange: setOpen,
        middleware: [flip({ padding: 10 }), size({ apply: updateFloatingStyle, padding: 10 })],
    });

    const role = useRole(context, { role: 'listbox' });
    const dismiss = useDismiss(context);

    const listNavParams = { listRef, activeIndex, onNavigate: setActiveIndex, virtual: true, loop: true };
    const listNav = useListNavigation(context, listNavParams);

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([role, dismiss, listNav]);

    const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);

        if (value) {
            setActiveIndex(0);
        }
    };

    const handleItemClick = (item: IAutocompleteInputItem) => {
        setInputValue(item.name);
        setOpen(false);
        refs.domReference.current?.focus();
    };

    const handleItemKeyDown = (event: KeyboardEvent<Element>) => {
        if (event.key === 'Enter' && activeIndex != null && items[activeIndex]) {
            setInputValue(items[activeIndex].name);
            setActiveIndex(null);
            setOpen(false);
        }
    };

    const buildItemProps = (item: IAutocompleteInputItem & { index: number }) => {
        const updateListRef = (node: HTMLElement | null) => {
            listRef.current[item.index] = node;
        };

        return getItemProps({ onClick: () => handleItemClick(item), ref: updateListRef });
    };

    const inputProps = getReferenceProps({
        value: inputValue,
        placeholder: 'Placeholder',
        ref: refs.setReference,
        onChange: onInputChange,
        onFocus: () => setOpen(true),
        onKeyDown: handleItemKeyDown,
    });

    const floatingMenuProps = getFloatingProps({ ref: refs.setFloating, style: floatingStyles });

    const isBottomPlacement = context.placement === 'bottom';

    const processedItems = items
        .filter((item) => item.name.toLowerCase().includes(inputValue.toLowerCase()))
        .map((item, index) => ({ ...item, index }));

    const groupedItems = Object.groupBy(processedItems, (item) => item.groupId ?? 'default');

    return (
        <>
            <InputText
                wrapperClassName={classNames(
                    { 'shadow-primary-lg': open },
                    { 'rounded-b-none border-b-0': open && isBottomPlacement },
                    { 'rounded-t-none border-t-0 z-10': open && !isBottomPlacement },
                )}
                autoComplete="off"
                {...inputProps}
            />
            <FloatingPortal>
                {open && (
                    <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss={true}>
                        <div
                            className={classNames(
                                'flex flex-col gap-3 overflow-hidden border-x border-primary-400 bg-neutral-0 shadow-primary-lg',
                                { 'rounded-b-xl border-b pt-1 md:pb-12': isBottomPlacement },
                                { 'rounded-t-xl border-t pb-1 md:pt-12': !isBottomPlacement },
                            )}
                            {...floatingMenuProps}
                        >
                            <div className="flex max-h-[268px] flex-col overflow-auto px-3">
                                {Object.keys(groupedItems).map((groupId) => (
                                    <AutocompleteInputGroup
                                        key={groupId}
                                        group={groups?.find((group) => group.id === groupId)}
                                    >
                                        {groupedItems[groupId]?.map((item) => (
                                            <AutocompleteInputItem
                                                key={item.id}
                                                isActive={activeIndex === item.index}
                                                item={item}
                                                {...buildItemProps(item)}
                                            />
                                        ))}
                                    </AutocompleteInputGroup>
                                ))}
                            </div>
                            <div
                                className={classNames(
                                    'absolute left-0 hidden w-full flex-row justify-between px-6 py-4 text-base font-normal leading-tight backdrop-blur-md md:flex',
                                    { 'bottom-0': isBottomPlacement },
                                    { 'top-0': !isBottomPlacement },
                                )}
                            >
                                <div className="flex flex-row items-center gap-1">
                                    <KeyboardShortcut>↑</KeyboardShortcut>
                                    <KeyboardShortcut>↓</KeyboardShortcut>
                                    <p className="text-neutral-500">Select</p>
                                </div>
                                <div className="flex flex-row items-center gap-1">
                                    <p className="text-neutral-500">Add action</p>
                                    <KeyboardShortcut>↵</KeyboardShortcut>
                                </div>
                            </div>
                        </div>
                    </FloatingFocusManager>
                )}
            </FloatingPortal>
        </>
    );
};
