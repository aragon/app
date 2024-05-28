import { HydrationBoundary, dehydrate, type QueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Container } from '../container';

export interface IPageProps extends ComponentProps<'div'> {
    /**
     * Query Client to share previously fetched data.
     */
    queryClient?: QueryClient;
}

export const Page: React.FC<IPageProps> = (props) => {
    const { className, queryClient, ...otherProps } = props;

    return (
        <HydrationBoundary state={queryClient ? dehydrate(queryClient) : null}>
            <Container className={classNames('py-4', className)} {...otherProps} />
        </HydrationBoundary>
    );
};
