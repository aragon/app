import { Page } from '@/shared/components/page';
import type { IWorkspaceDetailsPageParams } from '../../types';
import { WorkspaceDetailsPageClient } from './workspaceDetailsPageClient';

export interface IWorkspaceDetailsPageProps {
    /**
     * Workspace page parameters.
     */
    params: Promise<IWorkspaceDetailsPageParams>;
}

export const WorkspaceDetailsPage: React.FC<
    IWorkspaceDetailsPageProps
> = async (props) => {
    const { params } = props;
    const { id } = await params;

    // The workspace endpoints are mocked by the client-side fetch interceptor, so the data is not
    // prefetched on the server yet.
    return (
        <Page.Container>
            <WorkspaceDetailsPageClient id={id} />
        </Page.Container>
    );
};
