import { ActionSimulation, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import type { Network } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    useSimulateDirectExecuteActions,
    useSimulateProposalActions,
} from '../../api/actionSimulationService';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { IProposalCreateAction } from '../publishProposalDialog';

export interface ISimulateActionsDialogParams {
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Address that calls `DAO.execute` and that the actions are therefore simulated from (the
     * `from` address): the governance plugin for proposals, the connected wallet for direct
     * execution.
     */
    from: string;
    /**
     * Address of the DAO the actions are executed on. Set only for direct execution, in which case
     * the actions are simulated against the DAO from the connected wallet (`from`) instead of a
     * governance plugin.
     */
    daoAddress?: string;
    /**
     * List of actions to simulate.
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
    const { actions, network, from, daoAddress, formId } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const proposalSimulation = useSimulateProposalActions();
    const directExecuteSimulation = useSimulateDirectExecuteActions();

    const isDirectExecute = daoAddress != null;
    const activeSimulation = isDirectExecute
        ? directExecuteSimulation
        : proposalSimulation;

    const { isError, isPending, status, data } = activeSimulation;

    useEffect(() => {
        if (status !== 'idle') {
            return;
        }

        const processedActions = actions.map(({ to, data, value }) => ({
            to,
            data,
            value: value.toString(),
        }));

        if (isDirectExecute) {
            directExecuteSimulation.mutate({
                urlParams: { network, daoAddress },
                body: { from, actions: processedActions },
            });
        } else {
            proposalSimulation.mutate({
                urlParams: { network, pluginAddress: from },
                body: { actions: processedActions },
            });
        }
    }, [
        actions,
        network,
        from,
        isDirectExecute,
        status,
        directExecuteSimulation.mutate,
        proposalSimulation.mutate,
        daoAddress,
    ]);

    const hasSimulationFailed = isError || data?.status === 'failed';
    const lastSimulation =
        data != null ? { ...data, timestamp: data.runAt } : undefined;

    const error = isError
        ? t('app.governance.simulateActionsDialog.error')
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
