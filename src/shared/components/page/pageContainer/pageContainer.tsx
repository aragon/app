import { HydrationBoundary, dehydrate, type QueryClient } from '@tanstack/react-query';
import type { ComponentProps } from 'react';

export interface IPageContainerProps extends ComponentProps<'div'> {
    /**
     * Query Client to share previously fetched data.
     */
    queryClient?: QueryClient;
}

export const PageContainer: React.FC<IPageContainerProps> = (props) => {
    const { queryClient, ...otherProps } = props;

    return (
        <HydrationBoundary state={queryClient ? dehydrate(queryClient) : null}>
            <div {...otherProps} />
        </HydrationBoundary>
    );
};
