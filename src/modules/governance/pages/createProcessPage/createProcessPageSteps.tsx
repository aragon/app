'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';
import { useWatch } from 'react-hook-form';
import { CreateProcessForm, type ICreateProcessFormData } from '../../components/createProcessForm';
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
    const addActions = useWatch<ICreateProcessFormData>({ name: 'addActions' });

    const [metadataStep, actionsStep, settingsStep] = steps;

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
                title={t(`app.governance.createProcessPage.steps.${CreateProcessWizardStep.ACTIONS}.title`)}
                description={t(
                    `app.governance.createProcessPage.steps.${CreateProcessWizardStep.ACTIONS}.description`,
                )}
                hidden={addActions === false}
                {...actionsStep}
            >
                <CreateProcessForm.Actions />
            </Wizard.Step>
            <Wizard.Step
                title={t(`app.governance.createProcessPage.steps.${CreateProcessWizardStep.SETTINGS}.title`)}
                description={t(
                    `app.governance.createProcessPage.steps.${CreateProcessWizardStep.SETTINGS}.description`,
                )}
                {...settingsStep}
            >
                <CreateProcessForm.Settings daoId={daoId} />
            </Wizard.Step>
        </>
    );
};
