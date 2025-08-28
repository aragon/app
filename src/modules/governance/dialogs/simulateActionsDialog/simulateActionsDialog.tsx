import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { wizardFormId } from '@/shared/components/wizards/wizard/wizardForm/wizardForm';
import { ActionSimulation, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import type { Network } from '../../../../shared/api/daoService';
import { useSimulateActions } from '../../api/actionSimulationService';
import type { IProposalCreateAction } from '../publishProposalDialog';

export interface ISimulateActionsDialogParams {
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Address of the plugin of the proposal.
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

    const { mutate: triggerSimulation, isError, isPending } = useSimulateActions();

    useEffect(() => {
        triggerSimulation({
            urlParams: { network },
            body: actions.map(({ to, data, value }) => ({ from: pluginAddress, to, data, value: value as string })),
        });
    }, []);

    const hasFailed = isError || status === 'failure';
    console.log('actionsactionsactions', actions);
    return (
        <>
            <Dialog.Header title={t(`app.governance.simulateActionsDialog.title`)} onClose={close} />
            <Dialog.Content className="pt-2 pb-3">
                <ActionSimulation
                    isEnabled={false}
                    isLoading={isPending}
                    totalActions={actions.length}
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
