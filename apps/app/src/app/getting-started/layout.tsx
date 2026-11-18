import {
    type ILayoutWizardCreateWorkspaceProps,
    LayoutWizardCreateWorkspace,
} from '@/modules/workspace/components/layoutWizardCreateWorkspace';

export default async function LayoutGettingStarted(
    props: Omit<ILayoutWizardCreateWorkspaceProps, 'name'>,
) {
    return (
        <LayoutWizardCreateWorkspace
            {...props}
            name="app.workspace.gettingStartedPage.name"
        />
    );
}
