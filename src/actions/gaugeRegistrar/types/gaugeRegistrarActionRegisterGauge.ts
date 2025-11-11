import type { IResource } from '@/shared/api/daoService';
import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { IGaugeRegistrarRegisterGaugeFormData } from '../components/gaugeRegistrarRegisterGaugeActionCreate/gaugeRegistrarRegisterGaugeActionCreateForm';
import type { GaugeRegistrarActionType } from './enum/gaugeRegistrarActionType';

export interface IGaugeRegistrarActionRegisterGauge extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeRegistrarActionType.REGISTER_GAUGE;
    /**
     * DAO id.
     */
    daoId: string;
    /**
     * Gauge details collected from the action form in create phase.
     */
    gaugeDetails?: IGaugeRegistrarRegisterGaugeFormData;
    /**
     * Gauge metadata returned in decoded actions by backend.
     */
    gaugeMetadata?: {
        /**
         * Gauge name.
         */
        name: string;
        /**
         * Gauge description.
         */
        description: string;
        /**
         * Gauge avatar. IPFS CID.
         */
        avatar?: string;
        /**
         * Gauge related links.
         */
        links?: IResource[];
    };
}
