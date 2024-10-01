import { generateToken } from '@/modules/finance/testUtils';
import { generatePluginSettings } from '@/shared/testUtils';
import { DaoTokenVotingMode, type ITokenPluginSettings } from '../../types';

export const generateTokenPluginSettings = (settings?: Partial<ITokenPluginSettings>): ITokenPluginSettings => ({
    ...generatePluginSettings(),
    votingMode: DaoTokenVotingMode.EARLY_EXECUTION,
    supportThreshold: 0,
    minDuration: 0,
    minParticipation: 0,
    minProposerVotingPower: '0',
    token: generateToken(),
    ...settings,
});
