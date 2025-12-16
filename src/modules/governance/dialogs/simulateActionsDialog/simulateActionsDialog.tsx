import type { Network } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ActionSimulation, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useSimulateActions } from '../../api/actionSimulationService';
import type { IProposalCreateAction } from '../publishProposalDialog';

export interface ISimulateActionsDialogParams {
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Address of the plugin on which the proposal is created.
     */
    pluginAddress: string;
    /**
     * List of actions to simulate.
     */
    actions: IProposalCreateAction[];
    /**
     * ID of the form to trigger the submit for.
     */
    formId?: string;
}

export interface ISimulateActionsDialogProps extends IDialogComponentProps<ISimulateActionsDialogParams> {}

export const SimulateActionsDialog: React.FC<ISimulateActionsDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'SimulateActionsDialog: params must be set for the dialog to work correctly');
    const { actions, network, pluginAddress, formId } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { mutate: simulateActions, isError, isPending, status, data } = useSimulateActions();

    useEffect(() => {
        if (status !== 'idle') {
            return;
        }

        const urlParams = { network, pluginAddress };
        const processedActions = actions.map(({ to, data, value }) => ({ to, data, value: value.toString() }));
        simulateActions({ urlParams, body: { actions: processedActions } });
    }, [actions, network, pluginAddress, status, simulateActions]);

    const hasSimulationFailed = isError || data?.status === 'failed';
    const lastSimulation = data != null ? { ...data, timestamp: data.runAt } : undefined;

    const error = isError ? t('app.governance.simulateActionsDialog.error') : undefined;
    const primaryLabel = t(`app.governance.simulateActionsDialog.action.${hasSimulationFailed ? 'error' : 'success'}`);

    const handleContinue = () => {
        if (formId) {
            const form = document.getElementById(formId);
            if (form instanceof HTMLFormElement) {
                form.requestSubmit();
                // Defer close to allow form submission to process
                setTimeout(() => close(), 0);
            }
        }
    };

    return (
        <>
            <Dialog.Header title={t(`app.governance.simulateActionsDialog.title`)} onClose={close} />
            <Dialog.Content className="pt-2 pb-3">
                <ActionSimulation
                    isEnabled={false}
                    isLoading={isPending}
                    totalActions={actions.length}
                    lastSimulation={lastSimulation}
                    error={error}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: primaryLabel,
                    disabled: isPending,
                    onClick: handleContinue,
                }}
                secondaryAction={{
                    label: t('app.governance.simulateActionsDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
