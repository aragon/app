import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';

export enum CreateDaoWizardStep {
    METADATA = 'METADATA',
    NETWORK = 'NETWORK',
}

export const createDaoWizardSteps: IWizardStepperStep[] = [
    {
        id: CreateDaoWizardStep.NETWORK,
        order: 0,
        meta: { name: `app.createDao.createDaoPage.steps.${CreateDaoWizardStep.NETWORK}.name` },
    },
    {
        id: CreateDaoWizardStep.METADATA,
        order: 1,
        meta: { name: `app.createDao.createDaoPage.steps.${CreateDaoWizardStep.METADATA}.name` },
    },
];
