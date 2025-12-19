import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import type { GaugeVoterActionType } from './enum/gaugeVoterActionType';

export interface IGaugeVoterActionDeactivateGauge
    extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeVoterActionType.DEACTIVATE_GAUGE;
    /**
     * Gauge selected for deactivation. Only in create form.
     */
    gaugeToDeactivate?: IGauge;
}
