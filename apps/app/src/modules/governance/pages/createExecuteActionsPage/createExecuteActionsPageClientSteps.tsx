import { useWatch } from 'react-hook-form';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useTranslations } from '../../../../shared/components/translationsProvider';
import { WizardPage } from '../../../../shared/components/wizards/wizardPage';
import {
    CreateExecuteActionsForm,
    type IExecuteActionsFormData,
} from '../../components/createExecuteActionsForm';
import { useSimulateActionsDropdown } from '../../hooks/useSimulateActionsDropdown';
import {
    CreateExecuteActionsWizardStep,
    createExecuteActionsWizardId,
    createExecuteActionsWizardSteps,
} from './createExecuteActionsPageDefinitions';

export interface ICreateExecuteActionsPageClientStepsProps {
    /**
     * ID of the DAO to execute actions on.
     */
    daoId: string;
}

export const CreateExecuteActionsPageClientSteps: React.FC<
    ICreateExecuteActionsPageClientStepsProps
> = (props) => {
    const { daoId } = props;
    const { t } = useTranslations();
    const { address } = useWalletAccount();

    const actions = useWatch<
        Record<string, IExecuteActionsFormData['actions']>
    >({ name: 'actions' });
    const [actionsStep] = createExecuteActionsWizardSteps;

    const simulateDropdownItems = useSimulateActionsDropdown({
        daoId,
        from: address,
        isDirectExecute: true,
        formId: createExecuteActionsWizardId,
    });

    return (
        <WizardPage.Step
            description={t(
                `app.governance.createExecuteActionsPage.steps.${CreateExecuteActionsWizardStep.ACTIONS}.description`,
            )}
            disableNext={actions?.length ? undefined : true}
            nextDropdownItems={simulateDropdownItems}
            title={t(
                `app.governance.createExecuteActionsPage.steps.${CreateExecuteActionsWizardStep.ACTIONS}.title`,
            )}
            {...actionsStep}
        >
            <CreateExecuteActionsForm.Actions daoId={daoId} />
        </WizardPage.Step>
    );
};
