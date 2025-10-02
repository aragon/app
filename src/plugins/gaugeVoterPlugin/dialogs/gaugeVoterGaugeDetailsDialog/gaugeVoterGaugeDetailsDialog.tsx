import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import type { IGaugeVoterPlugin } from '../../types';

export interface IGaugeVoterGaugeDetailsDialogParams {
    /**
     * The gauge to show details for.
     */
    gauge: IGauge;
    /**
     * Gauge voter plugin instance.
     */
    plugin: IGaugeVoterPlugin;
    /**
     * Callback called on dialog close.
     */
    close: () => void;
}

export interface IGaugeVoterGaugeDetailsDialogProps
    extends IDialogComponentProps<IGaugeVoterGaugeDetailsDialogParams> {}

export const GaugeVoterGaugeDetailsDialog: React.FC<IGaugeVoterGaugeDetailsDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'GaugeVoterGaugeDetailsDialog: required parameters must be set.');

    const { close } = location.params;

    return (
        <>
            <Dialog.Header title="Gauge Details" onClose={close} />
            <Dialog.Content className="flex flex-col gap-6 py-7">
                <p className="text-neutral-600">
                    This is a placeholder for the gauge details dialog. 
                    Business logic will be implemented later.
                </p>
            </Dialog.Content>
        </>
    );
};