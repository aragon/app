import { Wizard } from '../../wizard';
import type { IWizardStepProps } from '../../wizard/wizardStep';

export interface IWizardDialogStepProps extends IWizardStepProps {}

export const WizardDialogStep: React.FC<IWizardDialogStepProps> = (props) => {
    return <Wizard.Step {...props} />;
};
