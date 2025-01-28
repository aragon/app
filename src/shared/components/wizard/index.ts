import { WizardFooter } from './wizardFooter';
import { WizardForm } from './wizardForm';
import { WizardRoot } from './wizardRoot';
import { WizardStep } from './wizardStep';
import { WizardStepPage } from './wizardStepPage/wizardStepPage';

export const Wizard = {
    Footer: WizardFooter,
    Form: WizardForm,
    Root: WizardRoot,
    Step: WizardStep,
    StepPage: WizardStepPage,
};

export * from './wizardFooter';
export * from './wizardForm';
export * from './wizardProvider';
export * from './wizardRoot';
export * from './wizardStep';
export * from './wizardStepPage';
