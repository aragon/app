import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';

export enum MpcCreateWizardStep {
    DETAILS = 'DETAILS',
    PASSPHRASE = 'PASSPHRASE',
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
        id: MpcCreateWizardStep.PASSPHRASE,
        order: 1,
        meta: {
            name: `app.mpc.mpcCreatePage.steps.${MpcCreateWizardStep.PASSPHRASE}.name`,
        },
    },
    {
        id: MpcCreateWizardStep.CEREMONY,
        order: 2,
        meta: {
            name: `app.mpc.mpcCreatePage.steps.${MpcCreateWizardStep.CEREMONY}.name`,
        },
    },
    {
        id: MpcCreateWizardStep.POLICY,
        order: 3,
        meta: {
            name: `app.mpc.mpcCreatePage.steps.${MpcCreateWizardStep.POLICY}.name`,
        },
    },
];
