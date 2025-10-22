import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { IResource } from '../../../shared/api/daoService';
import type { IRegisterGaugeFormData } from '../components/gaugeRegistrarRegisterGaugeAction/registerGaugeForm';
import type { GaugeRegistrarActionType } from './enum/gaugeRegistrarActionType';

export interface IGaugeRegistrarActionRegisterGauge extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeRegistrarActionType.REGISTER_GAUGE;
    /**
     * Gauge details collected from the action form in create phase.
     */
    gaugeDetails: IRegisterGaugeFormData | null;
    /**
     * Gauge metadata returned in decoded actions by backend.
     */
    gaugeMetadata?: {
        name: string;
        description: string;
        avatar?: string;
        links?: IResource[];
    };
}
