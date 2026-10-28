import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { notFound, unstable_rethrow } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import { daoOptions, type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { errorUtils } from '@/shared/utils/errorUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { BannerDao } from '../../bannerDao';
import { DaoOnboardingWatchers } from '../../daoOnboardingWatchers';
import { ErrorBoundary } from '../../errorBoundary';
import { NavigationDao } from '../../navigations/navigationDao';
import { LayoutSidebar } from '../layoutSidebar';

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
    const [daoPageParams, withSidebar] = await Promise.all([
        params,
        // The side navigation ships with workspaces and mirrors their navigation on the DAO pages. Resolved on the
        // server so the page never paints the navigation bar first.
        featureFlags.isEnabled('workspaces'),
    ]);
    let dao: IDao;

    const queryClient = new QueryClient();

    // An unknown network is a 404, not an error state: the status is what crawlers and the
    // bots behind nearly all of this traffic act on, and the DAO not-found page keeps the copy.
    if (!networkUtils.isValidNetwork(daoPageParams.network)) {
        notFound();
    }

    try {
        const daoId = await daoUtils.resolveDaoId(daoPageParams);
        const daoUrlParams = { id: daoId };
        [dao] = await Promise.all([
            queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams })),
            queryClient.prefetchQuery(daoOverridesOptions()),
        ]);
    } catch (error: unknown) {
        // A malformed DAO URL ends in notFound() inside resolveDaoId; let Next render the 404
        // page instead of turning it into the generic error state.
        unstable_rethrow(error);

        // A DAO the backend rejects or does not know is the same 404 as a malformed URL.
        if (
            AragonBackendServiceError.isExpectedNotFoundError(error) ||
            AragonBackendServiceError.isUnresolvableResourceError(error)
        ) {
            notFound();
        }

        const parsedError = errorUtils.serialize(error);
        return <Page.Error error={parsedError} />;
    }

    const content = (
        <>
            <BannerDao dao={dao} />
            <DaoOnboardingWatchers dao={dao} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </>
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {withSidebar ? (
                <LayoutSidebar
                    navigation={<NavigationDao dao={dao} withSidebar={true} />}
                >
                    {content}
                </LayoutSidebar>
            ) : (
                <>
                    <NavigationDao dao={dao} />
                    {content}
                </>
            )}
        </HydrationBoundary>
    );
};
