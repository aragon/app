import { LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';

export interface ILayoutWizardCreateWorkspaceProps {}

export const LayoutWizardCreateWorkspace: React.FC<
    ILayoutWizardCreateWorkspaceProps
> = (props) => (
    <LayoutWizard
        exitPath="/"
        name="app.workspace.layoutWizardCreateWorkspace.name"
        {...props}
    />
);
