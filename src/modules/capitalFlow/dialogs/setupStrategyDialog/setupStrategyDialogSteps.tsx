import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { useWatch } from 'react-hook-form';
import { type ISetupStrategyForm, RouterType } from './setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionFixed } from './setupStrategyDialogDistributionFixed';
import { SetupStrategyDialogDistributionStream } from './setupStrategyDialogDistributionStream';
import { SetupStrategyDialogRouterType } from './setupStrategyDialogRouterType';
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
    { id: 'routerType', order: 3, meta: { name: '' } },
    { id: 'distributionFixed', order: 4, meta: { name: '' } },
    { id: 'distributionStream', order: 4, meta: { name: '' } },
];

export const SetupStrategyDialogSteps: React.FC<ISetupStrategyDialogStepsProps> = (props) => {
    const { initialValues, daoId } = props;
    const selectedRouterType = useWatch<ISetupStrategyForm, 'routerType'>({ name: 'routerType' });

    const [selectStep, sourceVaultStep, routerTypeStep, distributionFixedStep, distributionStreamStep] =
        setupStrategySteps;

    return (
        <>
            <WizardDialog.Step {...selectStep} hidden={initialValues != null}>
                <SetupStrategyDialogSelect />
            </WizardDialog.Step>
            <WizardDialog.Step {...sourceVaultStep}>
                <SetupStrategyDialogSourceVault daoId={daoId} />
            </WizardDialog.Step>
            <WizardDialog.Step {...routerTypeStep}>
                <SetupStrategyDialogRouterType />
            </WizardDialog.Step>
            <WizardDialog.Step {...distributionFixedStep} hidden={selectedRouterType !== RouterType.FIXED}>
                <SetupStrategyDialogDistributionFixed />
            </WizardDialog.Step>
            <WizardDialog.Step {...distributionStreamStep} hidden={selectedRouterType !== RouterType.STREAM}>
                <SetupStrategyDialogDistributionStream />
            </WizardDialog.Step>
        </>
    );
};
