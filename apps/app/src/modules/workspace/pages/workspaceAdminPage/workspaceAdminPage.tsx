// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceAdminPageClient } from './workspaceAdminPageClient';

export interface IWorkspaceAdminPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Admin page of a workspace: its details, accounts and storage. Not prefetched: workspaces live in browser storage.
 */
export const WorkspaceAdminPage: React.FC<IWorkspaceAdminPageProps> = async (
    props,
) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <Page.Content>
                <WorkspaceAdminPageClient workspaceId={workspaceId} />
            </Page.Content>
        </Page.Container>
    );
};
