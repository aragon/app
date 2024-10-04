import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
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

    try {
        const daoUrlParams = { id };
        await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));
    } catch (error: unknown) {
        return (
            <Page.Error
                error={JSON.parse(JSON.stringify(error))}
                actionLink="/"
                notFoundNamespace="app.application.layoutDao"
            />
        );
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NavigationDao id={id} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
