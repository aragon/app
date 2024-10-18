import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';

export enum CreateDaoWizardStep {
    DEBUG = 'DEBUG',
    METADATA = 'METADATA',
}

export const createDaoWizardSteps: IWizardStepperStep[] = [
    {
        id: CreateDaoWizardStep.DEBUG,
        order: 0,
        meta: { name: `app.createDao.createDaoPage.steps.${CreateDaoWizardStep.DEBUG}.name` },
    },
    {
        id: CreateDaoWizardStep.METADATA,
        order: 1,
        meta: { name: `app.createDao.createDaoPage.steps.${CreateDaoWizardStep.METADATA}.name` },
    },
];
