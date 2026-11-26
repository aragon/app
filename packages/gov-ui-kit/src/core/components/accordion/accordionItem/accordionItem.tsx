import { AccordionItem as RadixAccordionItem } from '@radix-ui/react-accordion';
import classNames from 'classnames';
import { type ComponentPropsWithRef, forwardRef } from 'react';

export interface IAccordionItemProps extends ComponentPropsWithRef<'div'> {
    /**
     * A unique value of the accordion item which can matched for default open selection from the root container.
     */
    value: string;
    /**
     * Determines whether the accordion item is disabled.
     */
    disabled?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, IAccordionItemProps>((props, ref) => {
    const { children, className, disabled, value, ...otherProps } = props;

    const accordionItemClasses = classNames(
        'w-full overflow-hidden rounded-xl border border-surface-default bg-surface-default', // base
        'data-disabled:border-surface-disabled', // disabled
        'data-[state=open]:border-surface-active-accordion data-[state=open]:shadow-surface-sm', // open
        'hover:border-surface-hover hover:shadow-surface-sm', // hover
        'ring-accent-focus focus-ring active:border-surface-active', // active / focus
        className,
    );

    return (
        <RadixAccordionItem
            className={accordionItemClasses}
            disabled={disabled}
            ref={ref}
            value={value}
            {...otherProps}
        >
            {children}
        </RadixAccordionItem>
    );
});

AccordionItem.displayName = 'AccordionItem';
