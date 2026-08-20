// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { MpcWorkspacePageClient } from './mpcWorkspacePageClient';

export interface IMpcWorkspacePageParams {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
}

export interface IMpcWorkspacePageProps {
    /**
     * Page parameters.
     */
    params: Promise<IMpcWorkspacePageParams>;
}

/**
 * Workspace page (/mpc/workspaces/[workspaceId]): its MPC systems, transaction policies and members.
 */
export const MpcWorkspacePage: React.FC<IMpcWorkspacePageProps> = async (
    props,
) => {
    const { params } = props;
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <MpcWorkspacePageClient workspaceId={workspaceId} />
        </Page.Container>
    );
};
