import classNames from 'classnames';
import type React from 'react';
import type { HTMLAttributes } from 'react';
import { Icon } from '../../icon';
import { type AlertVariant, alertVariantToIconType } from '../alertUtils';

export interface IAlertCardProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * The alert message.
     */
    message: string;
    /**
     * Variant of the alert.
     * @default info
     */
    variant?: AlertVariant;
}

// Maps alert variants to container class names.
const alertVariantToContainerClassNames: Record<AlertVariant, string> = {
    critical: 'border-critical-primary shadow-critical-default',
    info: 'border-info-primary shadow-info-default',
    success: 'border-success-primary shadow-success-default',
    warning: 'border-warning-primary shadow-warning-default',
};

// Maps alert variants to icon class names.
const alertVariantToIconClassNames: Record<AlertVariant, string> = {
    critical: 'icon-critical-primary',
    info: 'icon-info-primary',
    success: 'icon-success-primary',
    warning: 'icon-warning-primary',
};

// Maps alert variants to message class names.
const alertVariantToMessageClassNames: Record<AlertVariant, string> = {
    critical: 'text-critical-primary',
    info: 'text-info-primary',
    success: 'text-success-primary',
    warning: 'text-warning-primary',
};

export const AlertCard: React.FC<IAlertCardProps> = (props) => {
    const { className, children, message, variant = 'info', ...otherProps } = props;

    return (
        <div
            className={classNames(
                'w-full rounded-xl border bg-surface-primary px-4 py-3 md:px-6 md:py-5',
                alertVariantToContainerClassNames[variant],
                className,
            )}
            role="alert"
            {...otherProps}
        >
            <div className="flex items-center gap-x-2 md:gap-x-3">
                <Icon className={alertVariantToIconClassNames[variant]} icon={alertVariantToIconType[variant]} />
                <p
                    className={classNames(
                        'flex-1 type-title-group--alert type-strong',
                        alertVariantToMessageClassNames[variant],
                    )}
                >
                    {message}
                </p>
            </div>
            {children && <div className="ml-6 type-body-compact text-surface-secondary md:ml-7">{children}</div>}
        </div>
    );
};
