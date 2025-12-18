import { generateToken } from '@/modules/finance/testUtils';
import type { ILockToVotePluginSettingsToken } from '../../types';

export const generateLockToVotePluginSettingsToken = (token?: Partial<ILockToVotePluginSettingsToken>): ILockToVotePluginSettingsToken => ({
    ...generateToken(),
    ...token,
});
