import { Wizard, type IWizardStepProps } from '../../wizard';

export interface IWizardDialogStepProps extends IWizardStepProps {}

export const WizardDialogStep: React.FC<IWizardDialogStepProps> = (props) => {
    return <Wizard.Step {...props} />;
};
