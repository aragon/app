import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import type { ISetupStrategyForm } from './setupStrategyDialogDefinitions';
import { SetupStrategyDialogSelect } from './setupStrategyDialogSelect';

export interface ISetupStrategyDialogStepsProps {
    /**
     * Initial values for the form.
     */
    initialValues?: ISetupStrategyForm;
}

const setupStrategySteps = [{ id: 'select', order: 1, meta: { name: '' } }];

export const SetupStrategyDialogSteps: React.FC<ISetupStrategyDialogStepsProps> = (props) => {
    const { initialValues } = props;

    const [selectStep] = setupStrategySteps;

    return (
        <>
            <WizardDialog.Step {...selectStep} hidden={initialValues != null}>
                <SetupStrategyDialogSelect />
            </WizardDialog.Step>
        </>
    );
};
