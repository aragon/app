import { ActionSimulation, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    useSimulateDirectExecuteActions,
    useSimulateProposalActions,
    useSimulateSafeActions,
} from '../../api/actionSimulationService';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { IProposalCreateAction } from '../publishProposalDialog';

/**
 * What runs the actions, which decides how they are simulated:
 * - `plugin`: a governance plugin calls `DAO.execute`, for a proposal;
 * - `dao`: the connected wallet calls `DAO.execute` directly (`from`), for direct execution;
 * - `safe`: the Safe runs them as one transaction, from one of its owners, before the transaction is created.
 */
export type SimulateActionsTarget =
    | { type: 'plugin'; pluginAddress: string }
    | { type: 'dao'; daoAddress: string; from: string }
    | { type: 'safe'; safeAddress: string };

export interface ISimulateActionsDialogParams {
    /**
     * Network the actions run on.
     */
    network: Network;
    /**
     * What runs the actions.
     */
    target: SimulateActionsTarget;
    /**
     * List of actions to simulate, already prepared.
     */
    actions: IProposalCreateAction[];
    /**
     * ID of the form to trigger the submit for.
     */
    formId?: string;
}

export interface ISimulateActionsDialogProps
    extends IDialogComponentProps<ISimulateActionsDialogParams> {}

export const SimulateActionsDialog: React.FC<ISimulateActionsDialogProps> = (
    props,
) => {
    const { location } = props;

    invariant(
        location.params != null,
        'SimulateActionsDialog: params must be set for the dialog to work correctly',
    );
    const { actions, network, target, formId } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const proposalSimulation = useSimulateProposalActions();
    const directExecuteSimulation = useSimulateDirectExecuteActions();
    const safeSimulation = useSimulateSafeActions();

    const simulations = {
        plugin: proposalSimulation,
        dao: directExecuteSimulation,
        safe: safeSimulation,
    };
    const {
        isError,
        isPending,
        status,
        data,
        error: failure,
    } = simulations[target.type];

    useEffect(() => {
        if (status !== 'idle') {
            return;
        }

        if (target.type === 'safe') {
            safeSimulation.mutate({
                network,
                safeAddress: target.safeAddress,
                actions,
            });
            return;
        }

        const processedActions = actions.map(({ to, data, value }) => ({
            to,
            data,
            value: value.toString(),
        }));

        if (target.type === 'dao') {
            directExecuteSimulation.mutate({
                urlParams: { network, daoAddress: target.daoAddress },
                body: { from: target.from, actions: processedActions },
            });
        } else {
            proposalSimulation.mutate({
                urlParams: { network, pluginAddress: target.pluginAddress },
                body: { actions: processedActions },
            });
        }
    }, [
        actions,
        network,
        target,
        status,
        directExecuteSimulation.mutate,
        proposalSimulation.mutate,
        safeSimulation.mutate,
    ]);

    const hasSimulationFailed = isError || data?.status === 'failed';
    const lastSimulation =
        data != null ? { ...data, timestamp: data.runAt } : undefined;

    // A Safe transaction that cannot be built failed on a chain read, so it reads as unavailable like a network error.
    let errorContext = 'error';
    if (AragonBackendServiceError.isSimulationBudgetError(failure)) {
        errorContext = 'limitReached';
    } else if (
        AragonBackendServiceError.isSimulationUnavailableError(failure)
    ) {
        errorContext = 'unavailable';
    }
    const error = isError
        ? t(`app.governance.simulateActionsDialog.${errorContext}`)
        : undefined;
    const primaryLabel = t(
        `app.governance.simulateActionsDialog.action.${hasSimulationFailed ? 'error' : 'success'}`,
    );

    const handleContinue = () => {
        // If the dialog is used as part of a wizard, trigger the wizard form submit.
        // Important: close only this dialog (by id) to avoid accidentally closing dialogs opened by the submit handler.
        if (formId != null) {
            const form = document.getElementById(formId);
            if (form instanceof HTMLFormElement) {
                form.requestSubmit();
            }
        }
        close(GovernanceDialogId.SIMULATE_ACTIONS);
    };

    return (
        <>
            <Dialog.Header
                onClose={() => close(GovernanceDialogId.SIMULATE_ACTIONS)}
                title={t('app.governance.simulateActionsDialog.title')}
            />
            <Dialog.Content className="pt-2 pb-3">
                <ActionSimulation
                    error={error}
                    isEnabled={false}
                    isLoading={isPending}
                    lastSimulation={lastSimulation}
                    totalActions={actions.length}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: primaryLabel,
                    disabled: isPending,
                    onClick: handleContinue,
                }}
                secondaryAction={{
                    label: t(
                        'app.governance.simulateActionsDialog.action.cancel',
                    ),
                    onClick: () => close(GovernanceDialogId.SIMULATE_ACTIONS),
                }}
            />
        </>
    );
};
