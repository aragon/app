import { Close, Description, Title } from '@radix-ui/react-dialog';
import classNames from 'classnames';
import type { ComponentPropsWithoutRef } from 'react';
import { AvatarIcon } from '../../../avatars';
import { IconType } from '../../../icon';

export interface IDialogHeaderProps extends ComponentPropsWithoutRef<'div'> {
    /**
     * Title of the dialog displayed on the header and used as the dialog's accessible name.
     */
    title: string;
    /**
     * Optional description of the dialog. When set here, the description stays sticky with the header
     * and remains visible while scrolling through long content.
     */
    description?: string;
    /**
     * Callback triggered on close button click. The close button is not displayed when the property is not set.
     */
    onClose?: () => void;
}

export const DialogHeader: React.FC<IDialogHeaderProps> = (props) => {
    const { title, onClose, className, description, ...otherProps } = props;

    const headerClassNames = classNames(
        'relative flex w-full items-start rounded-t-xl backdrop-blur-md gradient-surface-primary-to-b', // Layout
        'pt-inset-surface pr-14 pb-inset-tight--6-8 pl-inset-surface md:pr-16', // Spacings (pr: room for the close button)
        className,
    );

    const closeButtonClassNames = classNames(
        'group cursor-pointer rounded-full border border-surface-default bg-surface-default p-1 outline-hidden', // Default
        'absolute top-3 right-3 md:top-4 md:right-4', // Positioning
        'focus-ring ring-accent-focus hover:border-surface-hover active:border-surface-active-control active:bg-surface-active-control', // Hover/Active/Focus states
    );

    return (
        <div className="flex flex-col items-start gap-y-related--fixed-8">
            <div className={headerClassNames} {...otherProps}>
                <Title className="flex-1 truncate type-title-group text-surface-primary">{title}</Title>
                <Close asChild={true}>
                    {onClose != null && (
                        <button className={closeButtonClassNames} onClick={onClose} type="button">
                            <AvatarIcon
                                backgroundWhite={true}
                                className="group-hover:bg-surface-hover"
                                icon={IconType.CLOSE}
                                size="sm"
                            />
                        </button>
                    )}
                </Close>
            </div>
            {description && (
                <Description className="mb-group--12-16 px-inset-surface type-body-compact--unstepped text-surface-secondary">
                    {description}
                </Description>
            )}
        </div>
    );
};
