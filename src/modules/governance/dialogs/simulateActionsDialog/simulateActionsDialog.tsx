import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, invariant, ProposalActionSimulationStructure, type IProposalAction } from '@aragon/gov-ui-kit';

export interface ISimulateActionsDialogParams {
    /**
     * List of actions to simulate.
     */
    actions: IProposalAction[];
    /**
     * Callback to be called when user decides to move forward after simulation.
     */
    onContinue: () => void;
}

export interface ISimulateActionsDialogProps extends IDialogComponentProps<ISimulateActionsDialogParams> {}

export const SimulateActionsDialog: React.FC<ISimulateActionsDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'SelectPluginDialog: params must be set for the dialog to work correctly');
    const { actions, onContinue } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { isSimulating, status } = { isSimulating: true, status: 'unknown' as const }; // Placeholder for actual simulation state

    const handleContinue = () => {
        close();
        onContinue();
    };

    return (
        <>
            <Dialog.Header title={t(`app.governance.simulateActionsDialog.title`)} onClose={close} />
            <Dialog.Content>
                <ProposalActionSimulationStructure isSimulating={isSimulating} status={status} totalActions={actions.length} />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.governance.simulateActionsDialog.action.continue'),
                    onClick: handleContinue,
                    disabled: isSimulating,
                }}
                secondaryAction={{
                    label: t('app.governance.simulateActionsDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
