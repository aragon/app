import { generateToken } from '@/modules/finance/testUtils';
import type { ITokenPluginSettingsToken } from '../../types';

export const generateTokenPluginSettingsToken = (
    token?: Partial<ITokenPluginSettingsToken>,
): ITokenPluginSettingsToken => ({
    features: { delegation: false },
    ...generateToken(),
    ...token,
});
