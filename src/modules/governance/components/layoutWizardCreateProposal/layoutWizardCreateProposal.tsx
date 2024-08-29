import { type ILayoutWizardProps, LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';

export interface ILayoutWizardCreateProposalProps extends Omit<ILayoutWizardProps, 'name'> {}

export const LayoutWizardCreateProposal: React.FC<ILayoutWizardCreateProposalProps> = (props) => {
    return <LayoutWizard name="app.governance.layoutWizardCreateProposal.name" {...props} />;
};
