'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';
import { WizardPage } from '@/shared/components/wizards/wizardPage';
import { CreateProcessForm } from '../../components/createProcessForm';
import { CreateProcessWizardStep } from './createProcessPageDefinitions';

export interface ICreateProcessPageClientStepsProps {
    /**
     * Steps of the wizard.
     */
    steps: IWizardStepperStep[];
    /**
     * The DAO ID.
     */
    daoId: string;
}

export const CreateProcessPageClientSteps: React.FC<ICreateProcessPageClientStepsProps> = (props) => {
    const { steps, daoId } = props;

    const { t } = useTranslations();
    const [metadataStep, processesStep, permissionsStep] = steps;

    return (
        <>
            <WizardPage.Step
                title={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.title`)}
                description={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.description`)}
                {...metadataStep}
            >
                <CreateProcessForm.Metadata />
            </WizardPage.Step>
            <WizardPage.Step
                title={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.STAGES}.title`)}
                description={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.STAGES}.description`)}
                {...processesStep}
            >
                <CreateProcessForm.Governance daoId={daoId} />
            </WizardPage.Step>
            <WizardPage.Step
                title={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.title`)}
                description={t(
                    `app.createDao.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.description`,
                )}
                helpText={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.helpText`)}
                {...permissionsStep}
            >
                <CreateProcessForm.Permissions />
            </WizardPage.Step>
        </>
    );
};
