import { type ILayoutWizardProps, LayoutWizard } from '@/modules/application/components/layouts/layoutWizard';

export interface ILayoutWizardCreateProposalProps extends ILayoutWizardProps {}

export const LayoutWizardCreateProposal: React.FC<ILayoutWizardCreateProposalProps> = (props) => {
    const { name, ...otherProps } = props;
    return <LayoutWizard name="app.application.layoutWizardCreateProposal.name" {...otherProps} />;
};
