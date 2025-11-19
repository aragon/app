import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import type { ISetupStrategyForm } from './setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistribution } from './setupStrategyDialogDistribution';
import { SetupStrategyDialogSelect } from './setupStrategyDialogSelect';
import { SetupStrategyDialogSourceVault } from './setupStrategyDialogSourceVault';

export interface ISetupStrategyDialogStepsProps {
    /**
     * Initial values for the form.
     */
    initialValues?: ISetupStrategyForm;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const setupStrategySteps = [
    { id: 'select', order: 1, meta: { name: '' } },
    { id: 'sourceVault', order: 2, meta: { name: '' } },
    { id: 'distribution', order: 3, meta: { name: '' } },
];

export const SetupStrategyDialogSteps: React.FC<ISetupStrategyDialogStepsProps> = (props) => {
    const { initialValues, daoId } = props;

    const [selectStep, sourceVaultStep, distributionStep] = setupStrategySteps;

    return (
        <>
            <WizardDialog.Step {...selectStep} hidden={initialValues != null}>
                <SetupStrategyDialogSelect />
            </WizardDialog.Step>
            <WizardDialog.Step {...sourceVaultStep}>
                <SetupStrategyDialogSourceVault daoId={daoId} />
            </WizardDialog.Step>
            <WizardDialog.Step {...distributionStep}>
                <SetupStrategyDialogDistribution />
            </WizardDialog.Step>
        </>
    );
};
