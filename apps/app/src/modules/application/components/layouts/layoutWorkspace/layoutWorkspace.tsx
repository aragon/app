import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
    type IWorkspace,
    workspaceOptions,
} from '@/modules/workspace/api/workspaceService';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IWorkspacePageParams } from '@/shared/types';
import { errorUtils } from '@/shared/utils/errorUtils';
import { ErrorBoundary } from '../../errorBoundary';
import { NavigationWorkspace } from '../../navigations/navigationWorkspace';

export interface ILayoutWorkspaceProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
    /**
     * URL parameters of the layout.
     */
    params: Promise<IWorkspacePageParams>;
}

export const LayoutWorkspace: React.FC<ILayoutWorkspaceProps> = async (
    props,
) => {
    const { params, children } = props;
    const { workspaceId } = await params;

    const queryClient = new QueryClient();
    let workspace: IWorkspace;

    try {
        workspace = await queryClient.fetchQuery(
            workspaceOptions({ urlParams: { id: workspaceId } }),
        );

        // The account DAOs back the account filter labels and the aside details of every workspace page, so they are
        // fetched once here rather than by each page.
        await Promise.all(
            workspace.accounts.map((account) =>
                queryClient.prefetchQuery(
                    daoOptions({ urlParams: { id: account.id } }),
                ),
            ),
        );
    } catch (error: unknown) {
        return (
            <Page.Error
                error={errorUtils.serialize(error)}
                errorNamespace="app.application.layoutWorkspace.error"
            />
        );
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NavigationWorkspace workspace={workspace} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
