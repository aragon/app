import { ComponentProps, forwardRef, useId } from 'react';

export interface IAutocompleteInputItemProps extends ComponentProps<'div'> {
    /**
     * Defines if the item is active or not.
     */
    isActive: boolean;
}

export const AutocompleteInputItem = forwardRef<HTMLDivElement, IAutocompleteInputItemProps>((props, ref) => {
    const { children, isActive, ...rest } = props;

    const id = useId();

    return (
        <div
            ref={ref}
            role="option"
            id={id}
            aria-selected={isActive}
            {...rest}
            style={{
                background: isActive ? 'lightblue' : 'none',
                padding: 4,
                cursor: 'default',
                ...rest.style,
            }}
        >
            {children}
        </div>
    );
});
