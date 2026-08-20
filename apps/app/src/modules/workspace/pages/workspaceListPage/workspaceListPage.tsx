import { Page } from '@/shared/components/page';
import { WorkspaceListPageClient } from './workspaceListPageClient';

export interface IWorkspaceListPageProps {}

export const WorkspaceListPage: React.FC<IWorkspaceListPageProps> = () => (
    <Page.Container>
        <WorkspaceListPageClient />
    </Page.Container>
);
