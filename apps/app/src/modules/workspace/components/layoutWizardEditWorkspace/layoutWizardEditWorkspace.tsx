import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';

export interface ILayoutWizardEditWorkspaceProps {
    /**
     * URL parameters of the layout.
     */
    params: Promise<IWorkspacePageParams>;
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

/**
 * Wizard layout of the edit-workspace flow, exiting to the aggregated overview of the edited workspace. Checks the
 * `workspaces` flag itself, so with the flag off the route is a plain 404 rather than a 404 inside the wizard.
 */
export const LayoutWizardEditWorkspace: React.FC<
    ILayoutWizardEditWorkspaceProps
> = async (props) => {
    const { params, children } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    const exitPath = workspaceUtils.getAccountScopeUrl(
        workspaceId,
        workspaceAllAccountsSegment,
        'overview',
    );

    return (
        <LayoutWizard
            exitPath={exitPath}
            name="app.workspace.layoutWizardEditWorkspace.name"
        >
            {children}
        </LayoutWizard>
    );
};
