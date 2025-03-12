import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { AragonIconLogo } from './aragonIconLogo';
import { AragonLogoWithText } from './aragonLogoWithText';

export type LogoVariant = 'primary' | 'white';
export type LogoSize = 'sm' | 'md' | 'lg';
export interface IAragonLogoProps extends ComponentProps<'div'> {
    /**
     * Logo color variant
     * @default 'primary'
     */
    variant?: LogoVariant;
    /**
     * Logo size
     * @default 'md'
     */
    size?: LogoSize;
    /**
     * Only the icon will be displayed regardless of breakpoint.
     */
    iconOnly?: boolean;
    /**
     * Only the icon will be displayed on mobile devices, full logo otherwise.
     */
    responsiveIconOnly?: boolean;
}

const logoVariantClassNames: Record<LogoVariant, string> = {
    primary: 'text-primary-400',
    white: 'text-neutral-0',
};

const logoSizeClassNames: Record<LogoSize, string> = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
};

export const AragonLogo: React.FC<IAragonLogoProps> = (props) => {
    const { variant = 'primary', size = 'md', iconOnly, className, responsiveIconOnly, ...otherProps } = props;

    const containerClasses = classNames(logoVariantClassNames[variant], logoSizeClassNames[size], className);

    if (!responsiveIconOnly) {
        return (
            <div className={containerClasses} {...otherProps}>
                {iconOnly ? <AragonIconLogo /> : <AragonLogoWithText />}
            </div>
        );
    }

    return (
        <div className={containerClasses} {...otherProps}>
            {/* Show icon only on mobile, hide on larger screens */}
            <div className="block h-full w-auto md:hidden" data-testid="mobile-logo-container">
                <AragonIconLogo />
            </div>
            {/* Hide on mobile, show on larger screens */}
            <div className="hidden h-full w-auto md:block" data-testid="desktop-logo-container">
                <AragonLogoWithText />
            </div>
        </div>
    );
};
