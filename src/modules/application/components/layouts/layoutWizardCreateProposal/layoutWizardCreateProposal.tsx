import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '../../errorBoundary';
import { NavigationWizard } from '../../navigations/navigationWizard';

export interface ILayoutWizardCreateProposalProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
    /**
     * URL parameters of the layout.
     */
    params: IDaoPageParams;
}

export const LayoutWizardCreateProposal: React.FC<ILayoutWizardCreateProposalProps> = async (props) => {
    const { params, children } = props;
    const { id } = params;

    const processStep = 'Create Proposal';

    const queryClient = new QueryClient();

    try {
        const daoUrlParams = { id };
        if (id) {
            await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));
        }
    } catch (error: unknown) {
        return (
            <Page.Error
                error={JSON.parse(JSON.stringify(error))}
                actionLink="/"
                notFoundNamespace="app.shared.wizard"
            />
        );
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NavigationWizard id={id} processStep={processStep} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
