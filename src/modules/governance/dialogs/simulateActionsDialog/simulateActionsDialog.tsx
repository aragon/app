import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { wizardFormId } from '@/shared/components/wizards/wizard/wizardForm/wizardForm';
import { ActionSimulation, Dialog, invariant } from '@aragon/gov-ui-kit';
import type { IProposalCreateAction } from '../publishProposalDialog';

export interface ISimulateActionsDialogParams {
    /**
     * List of actions to simulate.
     */
    actions: IProposalCreateAction[];
}

export interface ISimulateActionsDialogProps extends IDialogComponentProps<ISimulateActionsDialogParams> {}

export const SimulateActionsDialog: React.FC<ISimulateActionsDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'SimulateActionsDialog: params must be set for the dialog to work correctly');
    const { actions } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { isSimulating, status } = { isSimulating: true, status: 'unknown' as const }; // Placeholder for actual simulation state

    const hasFailed = status === 'failure';
    console.log('actionsactionsactions', actions);
    return (
        <>
            <Dialog.Header title={t(`app.governance.simulateActionsDialog.title`)} onClose={close} />
            <Dialog.Content className="pt-2 pb-3">
                <ActionSimulation isEnabled={false} isLoading={isSimulating} totalActions={actions.length} />
            </Dialog.Content>
            <Dialog.Footer
                hasError={hasFailed}
                primaryAction={{
                    type: 'submit',
                    form: wizardFormId,
                    label: t(
                        `app.governance.simulateActionsDialog.action.${hasFailed ? 'continueAnyway' : 'continue'}`,
                    ),
                    disabled: isSimulating,
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
