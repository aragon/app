// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceDetailsPageClient } from './workspaceDetailsPageClient';

export interface IWorkspaceDetailsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Overview of a workspace: its metadata, the accounts it aggregates and its targets.
 *
 * Nothing is prefetched: the page renders the workspace itself, which only exists in the local-storage registry and
 * is therefore resolved on the client (see `docs/projectDocs/createWorkspace.md`). The dashboard of a single
 * account is an account-scoped page, which — the account being on its path — can prefetch the DAO it needs.
 */
export const WorkspaceDetailsPage: React.FC<
    IWorkspaceDetailsPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <WorkspaceDetailsPageClient workspaceId={workspaceId} />
        </Page.Container>
    );
};
