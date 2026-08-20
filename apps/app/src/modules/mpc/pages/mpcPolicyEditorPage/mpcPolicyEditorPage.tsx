// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { MpcPolicyEditorPageClient } from './mpcPolicyEditorPageClient';

export interface IMpcPolicyEditorPageParams {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * ID of the policy to edit (absent for a new policy).
     */
    policyId?: string;
}

export interface IMpcPolicyEditorPageProps {
    /**
     * Page parameters.
     */
    params: Promise<IMpcPolicyEditorPageParams>;
}

/**
 * Policy editor page: /mpc/workspaces/[workspaceId]/policies/new (create) and .../policies/[policyId] (edit).
 */
export const MpcPolicyEditorPage: React.FC<IMpcPolicyEditorPageProps> = async (
    props,
) => {
    const { params } = props;
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    const { workspaceId, policyId } = await params;

    return (
        <Page.Container>
            <MpcPolicyEditorPageClient
                policyId={policyId}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
