import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWizardPageStepDropdownItem } from '@/shared/components/wizards/wizardPage';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { ICreateProposalFormData } from '../../components/createProposalForm';
import { useCreateProposalFormContext } from '../../components/createProposalForm/createProposalFormProvider';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type {
    ISimulateActionsDialogParams,
    SimulateActionsTarget,
} from '../../dialogs/simulateActionsDialog';
import { proposalActionPreparationUtils } from '../../utils/proposalActionPreparationUtils';

export interface IUseSimulateActionsDropdownParams {
    /**
     * Network the actions run on.
     */
    network: Network;
    /**
     * What runs the actions, which decides how they are simulated. When `undefined` (e.g. direct execution without
     * a connected wallet) the dropdown is not rendered.
     */
    target?: SimulateActionsTarget;
    /**
     * ID of the wizard form to submit when skipping simulation or continuing after it.
     */
    formId: string;
}

/**
 * Builds the "Simulate actions" / "Skip simulation" dropdown shared by the create-proposal, direct-execute and
 * Safe-transaction flows. Returns the dropdown items for the wizard step, or `undefined` when simulation is
 * unavailable (no target, no actions, or the network is not supported by Tenderly), in which case the step renders
 * its plain submit button.
 */
export const useSimulateActionsDropdown = (
    params: IUseSimulateActionsDropdownParams,
): IWizardPageStepDropdownItem[] | undefined => {
    const { network, target, formId } = params;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { trigger, getValues } = useFormContext();
    const { prepareActions } = useCreateProposalFormContext();

    const { tenderlySupport } = networkDefinitions[network];
    const watchedActions =
        useWatch<Record<string, ICreateProposalFormData['actions']>>({
            name: 'actions',
        }) ?? [];

    const handleSimulate = useCallback(async () => {
        if (target == null) {
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
            target,
            actions: processedActions,
            formId,
        };
        open(GovernanceDialogId.SIMULATE_ACTIONS, { params: dialogParams });
    }, [target, trigger, getValues, prepareActions, network, formId, open]);

    return useMemo(() => {
        if (watchedActions.length === 0 || !tenderlySupport || target == null) {
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
    }, [
        watchedActions.length,
        tenderlySupport,
        target,
        t,
        handleSimulate,
        formId,
    ]);
};
