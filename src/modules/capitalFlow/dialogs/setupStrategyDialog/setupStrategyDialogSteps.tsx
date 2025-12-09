import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { useWatch } from 'react-hook-form';
import { type ISetupStrategyForm, RouterType } from './setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionBurn } from './setupStrategyDialogDistributionBurn';
import { SetupStrategyDialogDistributionDexSwap } from './setupStrategyDialogDistributionDexSwap';
import { SetupStrategyDialogDistributionFixed } from './setupStrategyDialogDistributionFixed';
import { SetupStrategyDialogDistributionGauge } from './setupStrategyDialogDistributionGauge';
import { SetupStrategyDialogDistributionMultiDispatch } from './setupStrategyDialogDistributionMultiDispatch';
import { SetupStrategyDialogDistributionStream } from './setupStrategyDialogDistributionStream';
import { SetupStrategyDialogDistributionUniswap } from './setupStrategyDialogDistributionUniswap/setupStrategyDialogDistributionUniswap';
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
    { id: 'distributionGauge', order: 4, meta: { name: '' } },
    { id: 'distributionBurn', order: 4, meta: { name: '' } },
    { id: 'distributionDexSwap', order: 4, meta: { name: '' } },
    { id: 'distributionMultiDispatch', order: 4, meta: { name: '' } },
    { id: 'distributionUniswap', order: 4, meta: { name: '' } },
];

export const SetupStrategyDialogSteps: React.FC<ISetupStrategyDialogStepsProps> = (props) => {
    const { initialValues, daoId } = props;
    const selectedRouterType = useWatch<ISetupStrategyForm, 'routerType'>({ name: 'routerType' });

    const [
        selectStep,
        sourceVaultStep,
        routerTypeStep,
        distributionFixedStep,
        distributionStreamStep,
        distributionGauge,
        distributionBurn,
        distributionDexSwap,
        distributionMultiDispatch,
        distributionUniswap,
    ] = setupStrategySteps;

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
            <WizardDialog.Step {...distributionGauge} hidden={selectedRouterType !== RouterType.GAUGE}>
                <SetupStrategyDialogDistributionGauge />
            </WizardDialog.Step>
            <WizardDialog.Step {...distributionBurn} hidden={selectedRouterType !== RouterType.BURN}>
                <SetupStrategyDialogDistributionBurn />
            </WizardDialog.Step>
            <WizardDialog.Step {...distributionDexSwap} hidden={selectedRouterType !== RouterType.DEX_SWAP}>
                <SetupStrategyDialogDistributionDexSwap />
            </WizardDialog.Step>
            <WizardDialog.Step {...distributionMultiDispatch} hidden={selectedRouterType !== RouterType.MULTI_DISPATCH}>
                <SetupStrategyDialogDistributionMultiDispatch />
            </WizardDialog.Step>
            <WizardDialog.Step {...distributionUniswap} hidden={selectedRouterType !== RouterType.UNISWAP}>
                <SetupStrategyDialogDistributionUniswap />
            </WizardDialog.Step>
        </>
    );
};
