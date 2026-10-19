import type { ReactNode } from 'react';
import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
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
 * Wizard layout of the edit-workspace flow, exiting to the aggregated overview of the edited workspace.
 */
export const LayoutWizardEditWorkspace: React.FC<
    ILayoutWizardEditWorkspaceProps
> = async (props) => {
    const { params, children } = props;
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
