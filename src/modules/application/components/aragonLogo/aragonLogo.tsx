import type { ComponentProps } from 'react';
import { AragonIconLogo } from './aragonIconLogo';
import { AragonLogoWithText } from './aragonLogoWithText';

export interface IAragonLogoProps extends ComponentProps<'div'> {
    /**
     * Only the icon will be displayed regardless of breakpoint.
     */
    iconOnly?: boolean;
    /**
     * Only the icon will be displayed on mobile devices, full logo otherwise.
     */
    responsiveIconOnly?: boolean;
}

export const AragonLogo: React.FC<IAragonLogoProps> = (props) => {
    const { className = 'h-8 text-primary-400', iconOnly, responsiveIconOnly, ...otherProps } = props;

    if (!responsiveIconOnly) {
        return (
            <div className={className} {...otherProps}>
                {iconOnly ? <AragonIconLogo /> : <AragonLogoWithText />}
            </div>
        );
    }

    return (
        <div className={className} {...otherProps}>
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
