import { Description } from '@radix-ui/react-dialog';
import classNames from 'classnames';
import type React from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export interface IDialogContentProps extends ComponentPropsWithoutRef<'div'> {
    /**
     * Optional description of the dialog.
     * Considering using the same prop on `DialogContentHeader` for sticky effect.
     */
    description?: string;
    /**
     * Removes the default paddings when set to true.
     * @default false
     */
    noInset?: boolean;
}

export const DialogContent: React.FC<IDialogContentProps> = (props) => {
    const { description, noInset = false, className, children, ...otherProps } = props;

    return (
        <div className={classNames('overflow-auto', { 'px-inset-surface': !noInset }, className)} {...otherProps}>
            {description && (
                <Description className="mb-group--12-16 text-sm leading-normal text-neutral-500">
                    {description}
                </Description>
            )}
            {children}
        </div>
    );
};
