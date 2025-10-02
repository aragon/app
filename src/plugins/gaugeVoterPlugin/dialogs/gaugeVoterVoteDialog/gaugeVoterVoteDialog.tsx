import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { Button, Dialog, invariant } from '@aragon/gov-ui-kit';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import type { IGaugeVoterPlugin } from '../../types';

export interface IGaugeVoterVoteDialogParams {
    /**
     * The gauge to vote on.
     */
    gauges: IGauge[];
    /**
     * Gauge voter plugin instance.
     */
    plugin: IGaugeVoterPlugin;
    /**
     * Network of the plugin.
     */
    network: Network;
    /**
     * Callback called on dialog close.
     */
    close: () => void;
}

export interface IGaugeVoterVoteDialogProps extends IDialogComponentProps<IGaugeVoterVoteDialogParams> {}

export const GaugeVoterVoteDialog: React.FC<IGaugeVoterVoteDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'GaugeVoterVoteDialog: required parameters must be set.');

    const { close } = location.params;

    return (
        <>
            <Dialog.Header title="Vote on Gauges" onClose={close} />
            <Dialog.Content className="flex flex-col gap-6 py-7">
                <p className="text-neutral-600">
                    This is a placeholder for the gauge voting dialog. Business logic will be implemented later.
                </p>
            </Dialog.Content>
            <Dialog.Footer>
                <Button variant="secondary" onClick={close}>
                    Cancel
                </Button>
                <Button variant="primary">Vote</Button>
            </Dialog.Footer>
        </>
    );
};
