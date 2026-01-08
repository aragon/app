import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { GaugeRegistrarActionType } from './enum/gaugeRegistrarActionType';
import type { IRegisteredGauge } from './gaugeRegistrar';

export interface IGaugeRegistrarActionUnregisterGauge
    extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeRegistrarActionType.UNREGISTER_GAUGE;
    /**
     * Gauge selected for removal. Only in create form.
     */
    gaugeToRemove?: IRegisteredGauge;
}
