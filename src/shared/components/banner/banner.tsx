import { Container } from '@/shared/components/container';
import { Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IBannerProps extends ComponentProps<'div'> {
    /**
     * Message of the banner.
     */
    message: string;
}

export const Banner: React.FC<IBannerProps> = (props) => {
    const { message, children, className, ...otherProps } = props;

    return (
        <div className={classNames('bg-warning-100 flex w-full', className)} {...otherProps}>
            <Container className="flex w-full grow flex-col justify-between gap-3 py-6 lg:flex-row">
                <div className="flex gap-x-3 lg:items-center">
                    <Icon icon={IconType.WARNING} className="text-warning-500 mt-1 lg:mt-0" />
                    <p className="text-warning-800 place-self-start lg:self-center">{message}</p>
                </div>
                <div className="ml-7 flex shrink-0 justify-start lg:ml-0 lg:justify-end">{children}</div>
            </Container>
        </div>
    );
};
