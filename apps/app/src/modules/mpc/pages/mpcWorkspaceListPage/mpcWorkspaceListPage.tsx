// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { MpcWorkspaceListPageClient } from './mpcWorkspaceListPageClient';

export interface IMpcWorkspaceListPageProps {}

/**
 * Landing page of the MPC section (/mpc): the workspaces the account can access.
 */
export const MpcWorkspaceListPage: React.FC<
    IMpcWorkspaceListPageProps
> = async () => {
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    return (
        <Page.Container>
            <MpcWorkspaceListPageClient />
        </Page.Container>
    );
};
