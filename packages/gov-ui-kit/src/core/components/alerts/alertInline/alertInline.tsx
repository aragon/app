import classNames from 'classnames';
import type React from 'react';
import type { HTMLAttributes } from 'react';
import { Icon } from '../../icon';
import { type AlertVariant, alertVariantToIconType } from '../alertUtils';

export interface IAlertInlineProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Alert text content.
     */
    message: string;
    /**
     * Defines the variant of the alert.
     * @default info
     */
    variant?: AlertVariant;
}

const variantToIconClassNames: Record<AlertVariant, string> = {
    critical: 'icon-critical-primary',
    info: 'icon-info-primary',
    success: 'icon-success-primary',
    warning: 'icon-warning-primary',
};

const variantToTextClassNames: Record<AlertVariant, string> = {
    critical: 'text-critical-primary',
    info: 'text-info-primary',
    success: 'text-success-primary',
    warning: 'text-warning-primary',
};

export const AlertInline: React.FC<IAlertInlineProps> = (props) => {
    const { className, message, variant = 'info', ...rest } = props;

    return (
        <div className={classNames('inline-flex items-center gap-x-2 rounded-md', className)} role="alert" {...rest}>
            <Icon
                className={variantToIconClassNames[variant]}
                icon={alertVariantToIconType[variant]}
                responsiveSize={{ md: 'md' }}
                size="sm"
            />
            <p className={classNames('type-supporting--inline-alert', variantToTextClassNames[variant])}>{message}</p>
        </div>
    );
};
