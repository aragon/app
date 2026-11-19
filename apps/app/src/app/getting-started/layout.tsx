import {
    type ILayoutWizardCreateWorkspaceProps,
    LayoutWizardCreateWorkspace,
} from '@/modules/workspace/components/layoutWizardCreateWorkspace';

export default async function LayoutGettingStarted(
    props: Omit<ILayoutWizardCreateWorkspaceProps, 'name' | 'exitPath'>,
) {
    return (
        <LayoutWizardCreateWorkspace
            {...props}
            // Leaving a flow the landing page leads back into would loop, so Explore is the way out.
            exitPath="/explore"
            name="app.workspace.gettingStartedPage.name"
        />
    );
}
