import type { Network } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { wizardFormId } from '@/shared/components/wizards/wizard/wizardForm/wizardForm';
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
}

export interface ISimulateActionsDialogProps extends IDialogComponentProps<ISimulateActionsDialogParams> {}

export const SimulateActionsDialog: React.FC<ISimulateActionsDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'SimulateActionsDialog: params must be set for the dialog to work correctly');
    const { actions, network, pluginAddress } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { mutate: triggerSimulation, isError, isPending, status, data } = useSimulateActions();

    useEffect(() => {
        if (status !== 'idle') {
            return;
        }

        triggerSimulation({
            urlParams: { network, pluginAddress },
            body: {
                actions: actions.map(({ to, data, value }) => ({ to, data, value: value.toString() })),
            },
        });
    }, [actions, network, pluginAddress, status, triggerSimulation]);

    const hasFailed = isError || data?.status === 'failed';

    return (
        <>
            <Dialog.Header title={t(`app.governance.simulateActionsDialog.title`)} onClose={close} />
            <Dialog.Content className="pt-2 pb-3">
                <ActionSimulation
                    isEnabled={false}
                    isLoading={isPending}
                    totalActions={actions.length}
                    lastSimulation={data && { url: data.url, timestamp: data.runAt, status: data.status }}
                    error={isError ? t('app.governance.simulateActionsDialog.error') : undefined}
                />
            </Dialog.Content>
            <Dialog.Footer
                hasError={hasFailed}
                primaryAction={{
                    type: 'submit',
                    form: wizardFormId,
                    label: t(
                        `app.governance.simulateActionsDialog.action.${hasFailed ? 'continueAnyway' : 'continue'}`,
                    ),
                    disabled: isPending,
                    onClick: () => close(),
                }}
                secondaryAction={{
                    label: t('app.governance.simulateActionsDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
