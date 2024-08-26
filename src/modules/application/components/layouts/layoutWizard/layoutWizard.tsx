import { daoOptions } from '@/shared/api/daoService';
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
    params: IDaoPageParams;
    /**
     * Title of the navigation action.
     */
    title?: string;
}

export const LayoutWizard: React.FC<ILayoutWizardProps> = async (props) => {
    const { params, title, children } = props;
    const { id } = params;

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
            <NavigationWizard id={id} title={title} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
