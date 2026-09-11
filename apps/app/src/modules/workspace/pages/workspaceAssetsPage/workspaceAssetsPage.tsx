// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceAssetsPageClient } from './workspaceAssetsPageClient';

export interface IWorkspaceAssetsPageProps {}

/**
 * Aggregated assets of a workspace. A placeholder for now: the page exists so that the navigation has somewhere to
 * point, and it will read `POST /v2/workspaces/query/assets` once that is wired up.
 */
export const WorkspaceAssetsPage: React.FC<
    IWorkspaceAssetsPageProps
> = async () => {
    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    return (
        <Page.Container>
            <WorkspaceAssetsPageClient />
        </Page.Container>
    );
};
