import { daoOptions, daoSettingsOptions } from '@/shared/api/daoService';
import type { IDaoPageParams } from '@/shared/types';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '../../errorBoundary';
import { NavigationDao } from '../../navigations/navigationDao';

export interface ILayoutDaoProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
    /**
     * URL parameters of the layout.
     */
    params: IDaoPageParams;
}

export const LayoutDao: React.FC<ILayoutDaoProps> = async (props) => {
    const { params, children } = props;
    const { id } = params;

    const queryClient = new QueryClient();

    const daoUrlParams = { id };
    await queryClient.prefetchQuery(daoOptions({ urlParams: daoUrlParams }));

    const daoSettingsUrlParams = { daoId: id };
    await queryClient.prefetchQuery(daoSettingsOptions({ urlParams: daoSettingsUrlParams }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NavigationDao id={id} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
