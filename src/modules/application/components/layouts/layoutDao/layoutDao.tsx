import { daoOptions, type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { BannerDao } from '../../bannerDao';
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
    params: Promise<IDaoPageParams>;
}

export const LayoutDao: React.FC<ILayoutDaoProps> = async (props) => {
    const { params, children } = props;
    const daoPageParams = await params;
    let dao: IDao;

    const queryClient = new QueryClient();

    try {
        const daoId = await daoUtils.resolveDaoId(daoPageParams);
        const daoUrlParams = { id: daoId };
        dao = await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));
    } catch (error: unknown) {
        return (
            <Page.Error
                error={JSON.parse(JSON.stringify(error)) as unknown}
                actionLink="/"
                notFoundNamespace="app.application.layoutDao"
            />
        );
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NavigationDao dao={dao} />
            <BannerDao dao={dao} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
