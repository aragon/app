'use client';

import { Wizard } from '@/shared/components/wizard';
import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';
import { CreateProcessForm } from '../../components/createProcessForm';
import { useTranslations } from '@/shared/components/translationsProvider';

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
                title={t('app.governance.createProcessForm.steps.metadata.title')}
                description={t('app.governance.createProcessForm.steps.metadata.description')}
                {...metadataStep}
            >
                <CreateProcessForm.Metadata />
            </Wizard.Step>
            <Wizard.Step
                title={t('app.governance.createProcessForm.steps.processes.title')}
                description={t('app.governance.createProcessForm.steps.processes.description')}
                {...processesStep}
            >
                <CreateProcessForm.Stages />
            </Wizard.Step>
            <Wizard.Step
                title={t('app.governance.createProcessForm.steps.permissions.title')}
                description={t('app.governance.createProcessForm.steps.permissions.description')}
                {...permissionsStep}
            >
                <CreateProcessForm.Permissions />
            </Wizard.Step>
        </>
    );
};
