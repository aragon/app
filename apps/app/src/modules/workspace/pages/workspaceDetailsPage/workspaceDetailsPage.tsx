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
 * The workspace is resolved on the client because the mocked registry is backed by local storage, therefore this
 * page intentionally performs no prefetch.
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
