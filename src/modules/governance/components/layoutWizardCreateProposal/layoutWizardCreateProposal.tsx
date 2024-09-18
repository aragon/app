import { type ILayoutWizardProps, LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';
import { type Route } from 'next';

export interface ILayoutWizardCreateProposalProps
    extends Omit<ILayoutWizardProps, 'name' | 'exitPath' | 'exitAlertDescription'> {}

export const LayoutWizardCreateProposal: React.FC<ILayoutWizardCreateProposalProps> = (props) => {
    const { params, ...otherProps } = props;
    const { id } = params ?? {};

    return (
        <LayoutWizard
            name="app.governance.layoutWizardCreateProposal.name"
            exitPath={`/dao/${id}/proposals/` as Route<string>}
            exitAlertDescription="app.governance.createProposalPage.exitAlertDescription"
            {...otherProps}
        />
    );
};
