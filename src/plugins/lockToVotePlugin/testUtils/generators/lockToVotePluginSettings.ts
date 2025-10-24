import { generatePluginSettings } from '@/shared/testUtils';
import { DaoLockToVoteVotingMode, type ILockToVotePluginSettings } from '../../types';
import { generateLockToVotePluginSettingsToken } from './lockToVotePluginSettingsToken';

export const generateLockToVotePluginSettings = (
    settings?: Partial<ILockToVotePluginSettings>,
): ILockToVotePluginSettings => ({
    ...generatePluginSettings(),
    votingMode: DaoLockToVoteVotingMode.STANDARD,
    supportThreshold: 0,
    minApprovalRatio: 0,
    minDuration: 0,
    minParticipation: 0,
    minProposerVotingPower: '0',
    token: generateLockToVotePluginSettingsToken(),
    // Default: no fees configured (bypass fee dialog)
    feePercent: 0,
    minFeePercent: 0,
    cooldown: 0,
    minCooldown: 0,
    ...settings,
});
