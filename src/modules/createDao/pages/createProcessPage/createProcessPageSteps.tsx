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
    const [metadataStep, processesStep, creationStep, permissionsStep] = steps;

    return (
        <>
            <WizardPage.Step
                description={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.description`)}
                title={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.METADATA}.title`)}
                {...metadataStep}
            >
                <CreateProcessForm.Metadata />
            </WizardPage.Step>
            <WizardPage.Step
                description={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.STAGES}.description`)}
                title={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.STAGES}.title`)}
                {...processesStep}
            >
                <CreateProcessForm.Governance daoId={daoId} />
            </WizardPage.Step>
            <WizardPage.Step
                description={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.PROPOSAL_CREATION}.description`)}
                title={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.PROPOSAL_CREATION}.title`)}
                {...creationStep}
            >
                <CreateProcessForm.ProposalCreation />
            </WizardPage.Step>
            <WizardPage.Step
                description={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.description`)}
                title={t(`app.createDao.createProcessPage.steps.${CreateProcessWizardStep.PERMISSIONS}.title`)}
                {...permissionsStep}
            >
                <CreateProcessForm.Permissions daoId={daoId} />
            </WizardPage.Step>
        </>
    );
};
