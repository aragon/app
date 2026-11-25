import { ActionSimulation, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import {
    type ISafeTransactionCallData,
    safeProtocolKitUtils,
} from '@/modules/safe/utils/safeProtocolKitUtils';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
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

/**
 * Builds the Safe transaction the actions make up, as the create dialog does, with a protocol kit that only reads.
 */
const buildSafeTransactionCall = async (
    network: Network,
    safeAddress: string,
    actions: IProposalCreateAction[],
): Promise<ISafeTransactionCallData> => {
    const protocolKit = await safeProtocolKitUtils.initReadOnly({
        chainId: networkDefinitions[network].id,
        safeAddress,
    });

    return safeProtocolKitUtils.buildTransactionCall({
        protocolKit,
        calls: actions,
    });
};

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

    // Building the Safe transaction happens before the mutation, so its failure is kept apart.
    const [safeBuildError, setSafeBuildError] = useState<unknown>();

    const simulations = {
        plugin: proposalSimulation,
        dao: directExecuteSimulation,
        safe: safeSimulation,
    };
    const {
        isError: isSimulationError,
        isPending: isSimulationPending,
        status,
        data,
        error: simulationError,
    } = simulations[target.type];

    useEffect(() => {
        if (status !== 'idle' || safeBuildError != null) {
            return;
        }

        if (target.type === 'safe') {
            let isCancelled = false;

            buildSafeTransactionCall(network, target.safeAddress, actions)
                .then((body) => {
                    if (!isCancelled) {
                        safeSimulation.mutate({
                            urlParams: {
                                network,
                                safeAddress: target.safeAddress,
                            },
                            body,
                        });
                    }
                })
                .catch((error: unknown) => {
                    if (!isCancelled) {
                        setSafeBuildError(error);
                    }
                });

            return () => {
                isCancelled = true;
            };
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
        safeBuildError,
        directExecuteSimulation.mutate,
        proposalSimulation.mutate,
        safeSimulation.mutate,
    ]);

    const isError = isSimulationError || safeBuildError != null;
    // A Safe transaction that cannot be built failed on a chain read, so it reads as unavailable like a network error.
    const failure = safeBuildError ?? simulationError;
    const isBuildingSafeTransaction =
        target.type === 'safe' && status === 'idle' && safeBuildError == null;
    const isPending = isSimulationPending || isBuildingSafeTransaction;

    const hasSimulationFailed = isError || data?.status === 'failed';
    const lastSimulation =
        data != null ? { ...data, timestamp: data.runAt } : undefined;

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
