'use client';

import { Wizard } from '@/shared/components/wizard';
import type { IWizardStepperStep } from '@/shared/components/wizard/wizardProvider';
import { CreateProcessForm } from '../../components/createProcessForm';

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

    const [metadataStep, processesStep, permissionsStep] = steps;
    return (
        <>
            <Wizard.Step
                title="Describe governance process"
                description="Provide all of the information members will need in order to understand the governance process."
                {...metadataStep}
            >
                <CreateProcessForm.Metadata />
            </Wizard.Step>
            <Wizard.Step title="Setup governance process" description="TBD" {...processesStep}>
                <CreateProcessForm.Stages />
            </Wizard.Step>
            <Wizard.Step title="Manage permissions" description="TBD" {...permissionsStep}>
                <CreateProcessForm.Permissions />
            </Wizard.Step>
        </>
    );
};
