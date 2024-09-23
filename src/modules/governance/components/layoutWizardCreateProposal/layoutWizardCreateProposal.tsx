import { type ILayoutWizardProps, LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import { type Route } from 'next';

export interface ILayoutWizardCreateProposalProps
    extends Omit<ILayoutWizardProps, 'name' | 'exitPath' | 'exitAlertDescription'> {}

export const LayoutWizardCreateProposal: React.FC<ILayoutWizardCreateProposalProps> = (props) => {
    return (
        <LayoutWizard
            name="app.governance.layoutWizardCreateProposal.name"
            exitPath={`/dao/${props.params?.id}/proposals/` as Route}
            exitAlertDescription="app.governance.createProposalPage.exitAlertDescription"
            {...props}
        />
    );
};
