import { generateToken } from '@/modules/finance/testUtils';
import type { IGaugeVoterPluginSettingsToken } from '../../types/gaugeVoterPlugin';

export const generateGaugeVoterPluginSettingsToken = (
    token?: Partial<IGaugeVoterPluginSettingsToken>,
): IGaugeVoterPluginSettingsToken => ({
    ...generateToken(),
    type: 'escrowAdapter',
    underlying: '0x0000000000000000000000000000000000000000',
    hasDelegate: false,
    ...token,
});
