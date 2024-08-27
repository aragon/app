import { daoOptions, daoSettingsOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '../../errorBoundary';
import { NavigationWizard } from '../../navigations/navigationWizard';

export interface ILayoutWizardProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
    /**
     * URL parameters of the layout.
     */
    params?: IDaoPageParams;
}

export const LayoutWizard: React.FC<ILayoutWizardProps> = async (props) => {
    const { params, children } = props;

    //TODO: Remove default with LayoutWizardCreateProposal (APP-3537)
    const processStep = 'Create Proposal';

    const queryClient = new QueryClient();

    try {
        if (params?.id != null) {
            const daoUrlParams = { id: params.id };
            const daoSettingsUrlParams = { daoId: params.id };

            await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));
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
            <NavigationWizard id={params?.id} processStep={processStep} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
