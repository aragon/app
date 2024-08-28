import { ErrorBoundary } from '@/modules/application/components/errorBoundary';
import { NavigationWizard } from '@/modules/application/components/navigations/navigationWizard';
import { daoOptions, daoSettingsOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

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
}

export const LayoutWizard: React.FC<ILayoutWizardProps> = async (props) => {
    const { params, name, children } = props;

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
                notFoundNamespace="app.shared.layoutWizard"
            />
        );
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NavigationWizard id={params?.id} name={name ?? 'Create DAO'} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
