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
import { useRef, useState } from 'react';
import type { IAutocompleteInputItem, IAutocompleteInputProps } from './autocompleteInput.api';
import { AutocompleteInputItem } from './autocompleteInputItem';

export const AutocompleteInput: React.FC<IAutocompleteInputProps> = (props) => {
    const { items } = props;

    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const listRef = useRef<Array<HTMLElement | null>>([]);

    const updateFloatingStyle = (params: MiddlewareState & { availableHeight: number }) => {
        const { rects, elements, availableHeight } = params;

        const newStyle = {
            width: `${rects.reference.width + 2}px`,
            maxHeight: `${availableHeight}px`,
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

    const updateListRef = (index: number) => (node: HTMLElement | null) => {
        listRef.current[index] = node;
    };

    const buildItemProps = (item: IAutocompleteInputItem, index: number) =>
        getItemProps({ key: item.id, onClick: () => handleItemClick(item), ref: updateListRef(index) });

    const inputProps = getReferenceProps({
        ref: refs.setReference,
        onChange: onInputChange,
        value: inputValue,
        placeholder: 'Enter fruit',
        'aria-autocomplete': 'list',
        onFocus: () => setOpen(true),
        onKeyDown(event) {
            if (event.key === 'Enter' && activeIndex != null && items[activeIndex]) {
                setInputValue(items[activeIndex].name);
                setActiveIndex(null);
                setOpen(false);
            }
        },
    });

    const floatingMenuProps = getFloatingProps({ ref: refs.setFloating, style: floatingStyles });

    const filteredItems = items.filter((item) => item.name.toLowerCase().includes(inputValue.toLowerCase()));

    const isBottomPlacement = context.placement === 'bottom';

    return (
        <>
            <InputText
                wrapperClassName={classNames(
                    { 'shadow-primary-lg': open },
                    { 'rounded-b-none border-b-0': open && isBottomPlacement },
                    { 'rounded-t-none border-t-0 z-10': open && !isBottomPlacement },
                )}
                {...inputProps}
            />
            <FloatingPortal>
                {open && (
                    <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss={true}>
                        <div
                            className={classNames(
                                'border-x border-primary-400 bg-neutral-0 shadow-primary-lg',
                                { 'rounded-b-xl border-b': isBottomPlacement },
                                { 'rounded-t-xl border-t': !isBottomPlacement },
                            )}
                            {...floatingMenuProps}
                        >
                            {filteredItems.map((item, index) => (
                                <AutocompleteInputItem
                                    {...buildItemProps(item, index)}
                                    isActive={activeIndex === index}
                                >
                                    {item.name}
                                </AutocompleteInputItem>
                            ))}
                        </div>
                    </FloatingFocusManager>
                )}
            </FloatingPortal>
        </>
    );
};
