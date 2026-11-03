// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceEntryPageClient } from './workspaceEntryPageClient';

export interface IWorkspaceEntryPageProps {}

/**
 * Entry point of the workspaces, `/workspace`: opens the first workspace of the registry, seeding the default one
 * when the registry is empty. A link into the workspaces that needs no workspace ID points here.
 *
 * The registry lives on local storage, so the workspace is resolved and the redirect issued on the client.
 */
export const WorkspaceEntryPage: React.FC<
    IWorkspaceEntryPageProps
> = async () => {
    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    return (
        <Page.Container>
            <WorkspaceEntryPageClient />
        </Page.Container>
    );
};
