// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IPageSearchParams, IWorkspacePageParams } from '@/shared/types';
import { WorkspaceGate } from '../../components/workspaceGate';
import {
    workspaceEditStepParam,
    workspaceUtils,
} from '../../utils/workspaceUtils';
import { WorkspaceEditPageClient } from './workspaceEditPageClient';

export interface IWorkspaceEditPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
    /**
     * Query parameters of the page, `step` naming the step the wizard opens on.
     */
    searchParams?: Promise<IPageSearchParams>;
}

/**
 * Edits a workspace with the workspace wizard. It sits outside `LayoutWorkspace`, so it renders its own
 * `WorkspaceGate` (see `createWorkspace.md` → Edit workspace).
 */
export const WorkspaceEditPage: React.FC<IWorkspaceEditPageProps> = async (
    props,
) => {
    const { params, searchParams } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;
    const initialStep = workspaceUtils.parseWorkspaceEditStep(
        (await searchParams)?.[workspaceEditStepParam],
    );

    return (
        <Page.Container>
            <WorkspaceGate workspaceId={workspaceId}>
                <WorkspaceEditPageClient
                    initialStep={initialStep}
                    workspaceId={workspaceId}
                />
            </WorkspaceGate>
        </Page.Container>
    );
};
