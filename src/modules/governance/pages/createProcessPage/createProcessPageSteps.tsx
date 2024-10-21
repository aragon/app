'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';
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
                title={t(`app.governance.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.title`)}
                description={t(
                    `app.governance.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.description`,
                )}
                {...metadataStep}
            >
                <CreateProcessForm.Metadata />
            </Wizard.Step>
            <Wizard.Step
                title={t(`app.governance.createProcessPage.steps.${CreateProcessWizardStep.STAGES}.title`)}
                description={t(`app.governance.createProcessPage.steps.${CreateProcessWizardStep.STAGES}.description`)}
                {...processesStep}
            >
                <CreateProcessForm.Stages />
            </Wizard.Step>
            <Wizard.Step
                title={t(`app.governance.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.title`)}
                description={t(
                    `app.governance.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.description`,
                )}
                {...permissionsStep}
            >
                <CreateProcessForm.Permissions />
            </Wizard.Step>
        </>
    );
};
