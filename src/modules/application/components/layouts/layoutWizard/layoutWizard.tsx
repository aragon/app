import { ErrorBoundary } from '@/modules/application/components/errorBoundary';
import { NavigationWizard } from '@/modules/application/components/navigations/navigationWizard';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { type Route } from 'next';

import type { ReactNode } from 'react';

export interface ILayoutWizardProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
    /**
     * URL parameters of the layout.
     */
    params?: IDaoPageParams;
    /**
     * Name of the wizard to display.
     */
    name: string;
    /**
     * Exit path to redirect to when exiting the wizard.
     */
    exitPath: Route;
}

export const LayoutWizard: React.FC<ILayoutWizardProps> = async (props) => {
    const { params, name, exitPath, children } = props;

    const queryClient = new QueryClient();

    try {
        if (params?.id != null) {
            const daoUrlParams = { id: params.id };
            await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));
        }
    } catch (error: unknown) {
        return (
            <Page.Error
                error={JSON.parse(JSON.stringify(error))}
                actionLink="/"
                notFoundNamespace="app.application.layoutWizard"
            />
        );
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NavigationWizard id={params?.id} name={name} exitPath={exitPath} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
