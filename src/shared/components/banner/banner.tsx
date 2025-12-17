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
        <div className={classNames('flex w-full bg-warning-100', className)} {...otherProps}>
            <Container className="flex w-full grow flex-col justify-between gap-3 py-6 lg:flex-row">
                <div className="flex gap-x-3 lg:items-center">
                    <Icon className="mt-1 text-warning-500 lg:mt-0" icon={IconType.WARNING} />
                    <p className="place-self-start text-warning-800 lg:self-center">{message}</p>
                </div>
                <div className="ml-7 flex shrink-0 justify-start lg:ml-0 lg:justify-end">{children}</div>
            </Container>
        </div>
    );
};
