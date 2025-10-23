import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { GaugeRegistrarActionType } from './enum/gaugeRegistrarActionType';

export interface IGaugeRegistrarActionUnregisterGauge extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeRegistrarActionType.UNREGISTER_GAUGE;
}
