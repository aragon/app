import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useTranslations } from '../../../../shared/components/translationsProvider';
import { WizardPage } from '../../../../shared/components/wizards/wizardPage';
import {
    CreateExecuteActionsForm,
    type IExecuteActionsFormData,
} from '../../components/createExecuteActionsForm';
import type { SimulateActionsTarget } from '../../dialogs/simulateActionsDialog';
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

    const { network, address: daoAddress } = daoUtils.parseDaoId(daoId);
    // Direct execution runs from the connected wallet, so there is nothing to simulate without one.
    const simulationTarget = useMemo<SimulateActionsTarget | undefined>(
        () =>
            address == null
                ? undefined
                : { type: 'dao', daoAddress, from: address },
        [address, daoAddress],
    );

    const simulateDropdownItems = useSimulateActionsDropdown({
        network,
        target: simulationTarget,
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
