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
    /**
     * Address of the native Safe that calls `DAO.execute`, so the actions are simulated from the
     * Safe (which holds `EXECUTE_PERMISSION`) rather than the connected owner EOA. When set, the
     * step also uses the native-Safe copy.
     */
    safeAddress?: string;
}

export const CreateExecuteActionsPageClientSteps: React.FC<
    ICreateExecuteActionsPageClientStepsProps
> = (props) => {
    const { daoId, safeAddress } = props;
    const isSafeProcess = safeAddress != null;
    const { t } = useTranslations();
    const { address } = useWalletAccount();

    const actions = useWatch<
        Record<string, IExecuteActionsFormData['actions']>
    >({ name: 'actions' });
    const [actionsStep] = createExecuteActionsWizardSteps;

    const simulateDropdownItems = useSimulateActionsDropdown({
        daoId,
        from: safeAddress ?? address,
        isDirectExecute: true,
        formId: createExecuteActionsWizardId,
    });
    return (
        <WizardPage.Step
            description={t(
                `app.governance.createExecuteActionsPage.steps.${CreateExecuteActionsWizardStep.ACTIONS}.${isSafeProcess ? 'safeDescription' : 'description'}`,
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
