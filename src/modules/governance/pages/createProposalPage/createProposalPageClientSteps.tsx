'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { Wizard } from '@/shared/components/wizard';
import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';
import { useWatch } from 'react-hook-form';
import { CreateProposalForm, type ICreateProposalFormData } from '../../components/createProposalForm';
import { CreateProposalWizardStep } from './createProposalPageDefinitions';

export interface ICreateProposalPageClientStepsProps {
    /**
     * Steps of the wizard.
     */
    steps: IWizardStepperStep[];
    /**
     * The DAO ID.
     */
    daoId: string;
}

export const CreateProposalPageClientSteps: React.FC<ICreateProposalPageClientStepsProps> = (props) => {
    const { steps, daoId } = props;

    const { t } = useTranslations();
    const addActions = useWatch<ICreateProposalFormData>({ name: 'addActions' });

    const [metadataStep, actionsStep, settingsStep] = steps;

    return (
        <>
            <Wizard.Step
                title={t(`app.governance.createProposalPage.steps.${CreateProposalWizardStep.METADATA}.title`)}
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.METADATA}.description`,
                )}
                {...metadataStep}
            >
                <CreateProposalForm.Metadata />
            </Wizard.Step>
            <Wizard.Step
                title={t(`app.governance.createProposalPage.steps.${CreateProposalWizardStep.ACTIONS}.title`)}
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.ACTIONS}.description`,
                )}
                hidden={addActions === false}
                {...actionsStep}
            >
                <CreateProposalForm.Actions />
            </Wizard.Step>
            <Wizard.Step
                title={t(`app.governance.createProposalPage.steps.${CreateProposalWizardStep.SETTINGS}.title`)}
                description={t(
                    `app.governance.createProposalPage.steps.${CreateProposalWizardStep.SETTINGS}.description`,
                )}
                {...settingsStep}
            >
                <CreateProposalForm.Settings daoId={daoId} />
            </Wizard.Step>
        </>
    );
};
