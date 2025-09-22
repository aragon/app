import { WizardForm } from './wizardForm';
import { WizardRoot } from './wizardRoot';
import { WizardStep } from './wizardStep';

export const Wizard = {
    Form: WizardForm,
    Root: WizardRoot,
    Step: WizardStep,
};

export * from './wizardForm';
export * from './wizardProvider';
export * from './wizardRoot';
export * from './wizardStep';

export { useWizardFooter, type IUseWizardFooterReturn } from './useWizardFooter';
