import { ErrorBoundary } from '@/modules/application/components/errorBoundary';
import { NavigationWizard } from '@/modules/application/components/navigations/navigationWizard';
import { daoOptions, daoSettingsOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { type Route } from 'next';

import type { ReactNode } from 'react';

export interface ILayoutWizardProps<TRouteType extends string = string> {
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
     * Exit description to explain the alert dialog when exiting the wizard.
     */
    exitAlertDescription: string;
    /**
     * Exit path to redirect to when exiting the wizard.
     */
    exitPath: Route<TRouteType>;
}

export const LayoutWizard: React.FC<ILayoutWizardProps<string>> = async (props) => {
    const { params, name, exitAlertDescription, exitPath, children } = props;

    const queryClient = new QueryClient();

    try {
        if (params?.id != null) {
            const daoUrlParams = { id: params.id };
            await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));

            const daoSettingsUrlParams = { daoId: params.id };
            await queryClient.fetchQuery(daoSettingsOptions({ urlParams: daoSettingsUrlParams }));
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
            <NavigationWizard
                id={params?.id}
                name={name}
                exitAlertDescription={exitAlertDescription}
                exitPath={exitPath}
            />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
