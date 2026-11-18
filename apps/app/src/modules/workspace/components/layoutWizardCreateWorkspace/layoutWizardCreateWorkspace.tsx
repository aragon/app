import { notFound } from 'next/navigation-server';
import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import { featureFlags } from '@/shared/featureFlags';

export interface ILayoutWizardCreateWorkspaceProps {
    /**
     * Key of the wizard name displayed on the navigation, the create-workspace one when not set.
     */
    name?: string;
}

/**
 * Wizard layout of the create workspace flow. Checks the `workspaces` flag itself, so with the flag off the route
 * is a plain 404 rather than a 404 inside the wizard. The getting-started flow shares it, differing only in its name.
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
            {...props}
            name={
                props.name ?? 'app.workspace.layoutWizardCreateWorkspace.name'
            }
        />
    );
};
