import { Title } from '@radix-ui/react-alert-dialog';
import classNames from 'classnames';
import type { ComponentPropsWithoutRef } from 'react';
import { AvatarIcon } from '../../../avatars';
import { IconType } from '../../../icon';
import { useDialogAlertContext } from '../dialogAlertContext';
import type { DialogAlertVariant } from '../dialogAlertRoot';

export interface IDialogAlertHeaderProps extends ComponentPropsWithoutRef<'div'> {
    /**
     * Title summarizing dialog's content or purpose.
     */
    title: string;
}

const dialogAlertVariantToIcon: Record<DialogAlertVariant, IconType> = {
    critical: IconType.CRITICAL,
    info: IconType.INFO,
    success: IconType.SUCCESS,
    warning: IconType.WARNING,
};

const dialogAlertVariantToTitleClass: Record<DialogAlertVariant, string> = {
    critical: 'text-critical-primary-title',
    info: 'text-info-primary-title',
    success: 'text-success-primary-title',
    warning: 'text-warning-primary-title',
};

export const DialogAlertHeader: React.FC<IDialogAlertHeaderProps> = (props) => {
    const { title, className, ...otherProps } = props;

    const { variant } = useDialogAlertContext();

    const headerClassNames = classNames(
        'flex w-full items-center gap-x-4 rounded-t-xl px-4 pt-4 pb-2 backdrop-blur-md gradient-surface-primary-to-b md:px-6 md:pt-6',
        className,
    );

    const titleClassNames = classNames('flex-1 truncate type-title-group', dialogAlertVariantToTitleClass[variant]);

    return (
        <div className={headerClassNames} {...otherProps}>
            <Title className={titleClassNames}>{title}</Title>
            <AvatarIcon icon={dialogAlertVariantToIcon[variant]} size="lg" variant={variant} />
        </div>
    );
};
