import type { IResource } from '@/shared/api/daoService';
import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { IGaugeVoterCreateGaugeFormData } from '../components/gaugeVoterCreateGaugeActionCreate';
import type { GaugeVoterActionType } from './enum/gaugeVoterActionType';

export interface IGaugeVoterActionCreateGauge extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeVoterActionType.CREATE_GAUGE;
    /**
     * DAO id.
     */
    daoId: string;
    /**
     * Gauge details collected from the action form in create phase.
     */
    gaugeDetails?: IGaugeVoterCreateGaugeFormData;
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
