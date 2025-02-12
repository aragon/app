import type { IWizardContext } from '@/shared/components/wizards/wizard';
import { generateStepperResult } from './stepperResult';

export const generateWizardContext = (values?: Partial<IWizardContext>): IWizardContext => ({
    submitLabel: 'submit',
    ...generateStepperResult(values),
    ...values,
});
