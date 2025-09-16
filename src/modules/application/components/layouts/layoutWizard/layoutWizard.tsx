import { ErrorBoundary } from '@/modules/application/components/errorBoundary';
import {
    type INavigationWizardProps,
    NavigationWizard,
} from '@/modules/application/components/navigations/navigationWizard';
import { daoOptions, type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
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
    const { addressOrEns, network } = (await params) ?? {};
    const reactQueryClient = queryClient ?? new QueryClient();
    let dao: IDao | undefined;

    try {
        const daoId = addressOrEns && network && (await daoUtils.resolveDaoId({ addressOrEns, network }));

        if (daoId != null) {
            const daoUrlParams = { id: daoId };
            dao = await reactQueryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));
        }
    } catch (error: unknown) {
        const parsedError = JSON.parse(JSON.stringify(error)) as unknown;
        return <Page.Error error={parsedError} errorNamespace="app.application.layoutWizard" />;
    }

    return (
        <HydrationBoundary state={dehydrate(reactQueryClient)}>
            <NavigationWizard dao={dao} name={name} exitPath={exitPath} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
