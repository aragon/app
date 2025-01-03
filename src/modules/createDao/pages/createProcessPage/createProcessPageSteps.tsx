'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWizardStepperStep } from '@/shared/components/wizard';
import { Wizard } from '@/shared/components/wizard';
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
    const { steps } = props;

    const { t } = useTranslations();
    const [metadataStep, processesStep, permissionsStep] = steps;

    return (
        <>
            <Wizard.Step
                title={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.title`)}
                description={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.description`)}
                {...metadataStep}
            >
                <CreateProcessForm.Metadata />
            </Wizard.Step>
            <Wizard.Step
                title={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.STAGES}.title`)}
                description={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.STAGES}.description`)}
                {...processesStep}
            >
                Stages step
            </Wizard.Step>
            <Wizard.Step
                title={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.title`)}
                description={t(
                    `app.createDao.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.description`,
                )}
                {...permissionsStep}
            >
                Permissions step
            </Wizard.Step>
        </>
    );
};
