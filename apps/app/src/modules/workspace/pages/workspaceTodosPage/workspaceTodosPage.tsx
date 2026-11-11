// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceTodosPageClient } from './workspaceTodosPageClient';

export interface IWorkspaceTodosPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * To-dos of the connected wallet across a workspace, serving both the aggregated route and the account-scoped one,
 * which re-export this same page. The client resolves which accounts to read from the route.
 *
 * Nothing is prefetched: to-dos belong to the wallet, which only the client knows, and the account list lives in
 * the local-storage registry (see `docs/projectDocs/createWorkspace.md`).
 */
export const WorkspaceTodosPage: React.FC<IWorkspaceTodosPageProps> = async (
    props,
) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <WorkspaceTodosPageClient workspaceId={workspaceId} />
        </Page.Container>
    );
};
