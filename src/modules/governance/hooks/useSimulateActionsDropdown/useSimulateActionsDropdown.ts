import { useFormContext, useWatch } from 'react-hook-form';
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
     * Address that calls `DAO.execute` and the actions are therefore simulated from (the `from`
     * address): the governance plugin for proposals, the connected wallet for direct execution.
     * When `undefined` (e.g. no connected wallet) the dropdown is not rendered.
     */
    from?: string;
    /**
     * Whether the actions are run through direct execution (simulated against the DAO from the
     * connected wallet) rather than a governance plugin. Defaults to `false`.
     */
    isDirectExecute?: boolean;
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
    const { daoId, from, isDirectExecute, formId } = params;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { trigger, getValues } = useFormContext();
    const { prepareActions } = useCreateProposalFormContext();

    const { network, address: daoAddress } = daoUtils.parseDaoId(daoId);
    const { tenderlySupport } = networkDefinitions[network];
    const watchedActions =
        useWatch<Record<string, ICreateProposalFormData['actions']>>({
            name: 'actions',
        }) ?? [];

    const handleSimulate = async () => {
        if (from == null) {
            return;
        }

        // Prevent running simulation if the form is invalid.
        const isValid = await trigger();
        if (!isValid) {
            return;
        }

        const actionsToSimulate =
            (getValues('actions') as
                | ICreateProposalFormData['actions']
                | undefined) ?? [];

        const processedActions =
            await proposalActionPreparationUtils.prepareActions({
                actions: actionsToSimulate,
                prepareActions,
            });

        const dialogParams: ISimulateActionsDialogParams = {
            network,
            from,
            actions: processedActions,
            formId,
            ...(isDirectExecute ? { daoAddress } : {}),
        };
        open(GovernanceDialogId.SIMULATE_ACTIONS, { params: dialogParams });
    };

    if (watchedActions.length === 0 || !tenderlySupport || from == null) {
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
