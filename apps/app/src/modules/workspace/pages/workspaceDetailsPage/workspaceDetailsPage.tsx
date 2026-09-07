import { Page } from '@/shared/components/page';
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
    const { workspaceId } = await params;

    return (
        <Page.Container>
            <WorkspaceDetailsPageClient workspaceId={workspaceId} />
        </Page.Container>
    );
};
