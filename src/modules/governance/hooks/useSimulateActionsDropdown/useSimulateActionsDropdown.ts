import { useFormContext } from 'react-hook-form';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWizardPageStepDropdownItem } from '@/shared/components/wizards/wizardPage';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { ICreateProposalFormData } from '../../components/createProposalForm';
import { useCreateProposalFormContext } from '../../components/createProposalForm/createProposalFormProvider';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { ISimulateActionsDialogParams } from '../../dialogs/simulateActionsDialog';
import { proposalActionPreparationUtils } from '../../utils/proposalActionPreparationUtils';

export interface IUseSimulateActionsDropdownParams {
    /**
     * ID of the DAO the actions belong to.
     */
    daoId: string;
    /**
     * Address the actions are simulated from (the `from` address): the governance plugin
     * for proposals, the DAO itself for direct execution.
     */
    from: string;
    /**
     * ID of the wizard form to submit when skipping simulation or continuing after it.
     */
    formId: string;
}

/**
 * Builds the "Simulate actions" / "Skip simulation" dropdown shared by the create-proposal and
 * direct-execute flows. Returns the dropdown items for the wizard step, or `undefined` when
 * simulation is unavailable (no actions, or the network is not supported by Tenderly), in which
 * case the step renders its plain submit button.
 */
export const useSimulateActionsDropdown = (
    params: IUseSimulateActionsDropdownParams,
): IWizardPageStepDropdownItem[] | undefined => {
    const { daoId, from, formId } = params;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { trigger, getValues } = useFormContext();
    const { prepareActions } = useCreateProposalFormContext();

    const { network } = daoUtils.parseDaoId(daoId);
    const { tenderlySupport } = networkDefinitions[network];

    const handleSimulate = async () => {
        // Prevent running simulation if the form is invalid.
        const isValid = await trigger();
        if (!isValid) {
            return;
        }

        const actions =
            (getValues('actions') as
                | ICreateProposalFormData['actions']
                | undefined) ?? [];
        const processedActions =
            await proposalActionPreparationUtils.prepareActions({
                actions,
                prepareActions,
            });

        const dialogParams: ISimulateActionsDialogParams = {
            network,
            from,
            actions: processedActions,
            formId,
        };
        open(GovernanceDialogId.SIMULATE_ACTIONS, { params: dialogParams });
    };

    const actions =
        (getValues('actions') as
            | ICreateProposalFormData['actions']
            | undefined) ?? [];

    if (!(actions.length > 0 && tenderlySupport)) {
        return undefined;
    }

    return [
        {
            label: t('app.governance.simulateActionsDialog.simulate'),
            onClick: handleSimulate,
        },
        {
            label: t('app.governance.simulateActionsDialog.skipSimulation'),
            formId,
        },
    ];
};
