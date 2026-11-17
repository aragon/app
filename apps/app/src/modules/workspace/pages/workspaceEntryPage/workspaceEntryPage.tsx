// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceEntryPageClient } from './workspaceEntryPageClient';

export interface IWorkspaceEntryPageProps {}

/**
 * `/workspace`: opens the first stored workspace; with none, Getting started for a connected wallet, else the landing
 * page. Links needing no workspace ID point here.
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
