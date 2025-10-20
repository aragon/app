import { type IProposalActionChangeSettings as IGukProposalActionChangeSettings } from '@aragon/gov-ui-kit';
import type { GaugeRegistrarActionType } from './enum/gaugeRegistrarActionType';

export interface IGaugeRegistrarActionRegisterGauge
    extends Omit<IGukProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    /**
     * The type of the proposal action.
     */
    type: GaugeRegistrarActionType.REGISTER_GAUGE;
    /**
     * Avatar of the gauge
     */
    avatar: string | null;
}
