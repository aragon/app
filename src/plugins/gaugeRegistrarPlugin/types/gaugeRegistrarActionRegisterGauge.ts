import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { IRegisterGaugeFormData } from '../components/gaugeRegistrarRegisterGaugeAction/registerGaugeForm';
import type { GaugeRegistrarActionType } from './enum/gaugeRegistrarActionType';

export interface IGaugeRegistrarActionRegisterGauge extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeRegistrarActionType.REGISTER_GAUGE;
    /**
     * Gauge details collected from the action form.
     */
    gaugeDetails: IRegisterGaugeFormData | null;
}
