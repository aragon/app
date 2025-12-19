import { type IWizardStepProps, Wizard } from '../../wizard';

export interface IWizardDialogStepProps extends IWizardStepProps {}

export const WizardDialogStep: React.FC<IWizardDialogStepProps> = (props) => (
    <Wizard.Step disableScrollToTop={true} {...props} />
);
