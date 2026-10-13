import { notFound } from 'next/navigation-server';
import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import { featureFlags } from '@/shared/featureFlags';

export interface ILayoutWizardCreateWorkspaceProps {}

/**
 * Wizard layout of the create workspace flow. Checks the `workspaces` flag itself, so with the flag off the route
 * is a plain 404 rather than a 404 inside the wizard.
 */
export const LayoutWizardCreateWorkspace: React.FC<
    ILayoutWizardCreateWorkspaceProps
> = async (props) => {
    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    return (
        <LayoutWizard
            exitPath="/"
            name="app.workspace.layoutWizardCreateWorkspace.name"
            {...props}
        />
    );
};
