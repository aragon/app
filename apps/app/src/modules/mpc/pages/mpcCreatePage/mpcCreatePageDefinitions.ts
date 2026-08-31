import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum MpcCreateWizardStep {
    DETAILS = 'DETAILS',
    CEREMONY = 'CEREMONY',
    POLICY = 'POLICY',
}

export const mpcCreateWizardSteps: IWizardStepperStep[] = [
    {
        id: MpcCreateWizardStep.DETAILS,
        order: 0,
        meta: {
            name: `app.mpc.mpcCreatePage.steps.${MpcCreateWizardStep.DETAILS}.name`,
        },
    },
    {
        id: MpcCreateWizardStep.CEREMONY,
        order: 1,
        meta: {
            name: `app.mpc.mpcCreatePage.steps.${MpcCreateWizardStep.CEREMONY}.name`,
        },
    },
    {
        id: MpcCreateWizardStep.POLICY,
        order: 2,
        meta: {
            name: `app.mpc.mpcCreatePage.steps.${MpcCreateWizardStep.POLICY}.name`,
        },
    },
];
