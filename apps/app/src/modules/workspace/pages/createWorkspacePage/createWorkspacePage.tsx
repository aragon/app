import { Page } from '@/shared/components/page';
import { CreateWorkspacePageClient } from './createWorkspacePageClient';

export interface ICreateWorkspacePageProps {}

export const CreateWorkspacePage: React.FC<ICreateWorkspacePageProps> = () => (
    <Page.Container>
        <CreateWorkspacePageClient />
    </Page.Container>
);
