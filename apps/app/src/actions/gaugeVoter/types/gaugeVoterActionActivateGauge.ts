import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import type { GaugeVoterActionType } from './enum/gaugeVoterActionType';

export interface IGaugeVoterActionActivateGauge
    extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeVoterActionType.ACTIVATE_GAUGE;
    /**
     * Gauge selected for activation. Only in create form.
     */
    gaugeToActivate?: IGauge;
}
