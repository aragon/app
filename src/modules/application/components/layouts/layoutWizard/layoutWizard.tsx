import { ErrorBoundary } from '@/modules/application/components/errorBoundary';
import {
    type INavigationWizardProps,
    NavigationWizard,
} from '@/modules/application/components/navigations/navigationWizard';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export interface ILayoutWizardProps<IPageParams extends IDaoPageParams = IDaoPageParams>
    extends Pick<INavigationWizardProps, 'name' | 'exitPath'> {
    /**
     * URL parameters of the layout.
     */
    params?: Promise<IPageParams>;
    /**
     * Optional query client to be used instead of generating a new instance of it.
     */
    queryClient?: QueryClient;
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

export const LayoutWizard = async <IPageParams extends IDaoPageParams = IDaoPageParams>(
    props: ILayoutWizardProps<IPageParams>,
) => {
    const { params, name, exitPath, queryClient, children } = props;
    const { id, network } = (await params) ?? {};
    const daoId = id && network && (await daoUtils.resolveDaoId({ id, network }));

    const reactQueryClient = queryClient ?? new QueryClient();

    try {
        if (daoId != null) {
            const daoUrlParams = { id: daoId };
            await reactQueryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));
        }
    } catch (error: unknown) {
        return (
            <Page.Error
                error={JSON.parse(JSON.stringify(error)) as unknown}
                actionLink="/"
                notFoundNamespace="app.application.layoutWizard"
            />
        );
    }

    return (
        <HydrationBoundary state={dehydrate(reactQueryClient)}>
            <NavigationWizard id={daoId} name={name} exitPath={exitPath} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
