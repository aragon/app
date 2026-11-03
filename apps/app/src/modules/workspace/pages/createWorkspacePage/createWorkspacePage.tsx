// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { CreateWorkspacePageClient } from './createWorkspacePageClient';

export interface ICreateWorkspacePageProps {}

export const CreateWorkspacePage: React.FC<
    ICreateWorkspacePageProps
> = async () => {
    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    return (
        <Page.Container>
            <CreateWorkspacePageClient />
        </Page.Container>
    );
};
