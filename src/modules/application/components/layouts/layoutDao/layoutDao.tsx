import { daoOptions } from '@/shared/api/daoService/queries/useDao';
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

    const queryClient = new QueryClient();

    const daoUrlParams = { slug: params.slug };
    const dao = await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }, { staleTime: Infinity }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HeaderDao dao={dao} />
            <main {...otherProps} />
        </HydrationBoundary>
    );
};
