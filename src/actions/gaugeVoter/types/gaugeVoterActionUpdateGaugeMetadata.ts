import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import type { IResource } from '@/shared/api/daoService';
import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { IGaugeVoterCreateGaugeFormData } from '../components/gaugeVoterCreateGaugeActionCreate';
import type { GaugeVoterActionType } from './enum/gaugeVoterActionType';

export interface IGaugeVoterActionUpdateGaugeMetadata extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeVoterActionType.UPDATE_GAUGE_METADATA;
    /**
     * DAO id.
     */
    daoId: string;
    /**
     * Gauge selected for metadata update. Only in create form.
     */
    gaugeToUpdate?: IGauge;
    /**
     * Updated gauge details collected from the action form in create phase.
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
