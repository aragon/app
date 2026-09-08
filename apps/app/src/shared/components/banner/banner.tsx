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
            className={classNames('flex w-full bg-warning-100', className)}
            {...otherProps}
        >
            <Container className="flex w-full grow @app-lg/app:flex-row flex-col justify-between gap-3 py-6">
                <div className="flex @app-lg/app:items-center gap-x-3">
                    <Icon
                        className="@app-lg/app:mt-0 mt-1 text-warning-500"
                        icon={IconType.WARNING}
                    />
                    <p className="place-self-start @app-lg/app:self-center text-warning-800">
                        {message}
                    </p>
                </div>
                <div className="@app-lg/app:ml-0 ml-7 flex shrink-0 justify-start @app-lg/app:justify-end">
                    {children}
                </div>
            </Container>
        </div>
    );
};
