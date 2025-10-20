import { type IProposalActionChangeSettings as IGukProposalActionChangeSettings } from '@aragon/gov-ui-kit';
import type { GaugeRegistrarActionType } from './enum/gaugeRegistrarActionType';

export interface IGaugeRegistrarActionUnregisterGauge
    extends Omit<IGukProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeRegistrarActionType.UNREGISTER_GAUGE;
}
