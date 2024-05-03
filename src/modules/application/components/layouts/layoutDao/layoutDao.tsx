import { daoOptions } from '@/shared/api/daoService';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { HeaderDao } from '../../headers/headerDao';

export interface ILayoutDaoProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
    /**
     * URL parameters of the layout.
     */
    params: { slug: string };
}

export const LayoutDao: React.FC<ILayoutDaoProps> = async (props) => {
    const { params, ...otherProps } = props;
    const { slug } = params;

    const queryClient = new QueryClient();

    const daoUrlParams = { slug };
    await queryClient.prefetchQuery(daoOptions({ urlParams: daoUrlParams }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HeaderDao slug={slug} />
            <main {...otherProps} />
        </HydrationBoundary>
    );
};
