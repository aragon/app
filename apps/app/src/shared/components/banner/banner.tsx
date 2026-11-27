import { Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Container } from '@/shared/components/container';

export interface IBannerProps extends ComponentProps<'div'> {
    /**
     * Message of the banner.
     */
    message: string;
}

export const Banner: React.FC<IBannerProps> = (props) => {
    const { message, children, className, ...otherProps } = props;

    return (
        <div
            className={classNames('flex w-full bg-warning-subtle', className)}
            {...otherProps}
        >
            <Container className="flex w-full grow flex-col justify-between gap-related py-inset-surface-wide lg:flex-row">
                <div className="flex gap-x-related lg:items-center">
                    <Icon
                        // biome-ignore lint/plugin/noPrimitiveSpacing: icon nudge to the first text line and the action indent past the icon, until lg
                        className="mt-1 icon-warning-primary lg:mt-0"
                        icon={IconType.WARNING}
                    />
                    <p className="place-self-start text-warning-primary lg:self-center">
                        {message}
                    </p>
                </div>
                {/* biome-ignore lint/plugin/noPrimitiveSpacing: icon nudge to the first text line and the action indent past the icon, until lg */}
                <div className="ml-7 flex shrink-0 justify-start lg:ml-0 lg:justify-end">
                    {children}
                </div>
            </Container>
        </div>
    );
};
