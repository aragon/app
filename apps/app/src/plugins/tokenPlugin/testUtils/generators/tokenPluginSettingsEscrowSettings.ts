import type { ITokenPluginSettingsEscrowSettings } from '../../types';

export const generateTokenPluginSettingsEscrowSettings = (
    settings?: Partial<ITokenPluginSettingsEscrowSettings>,
): ITokenPluginSettingsEscrowSettings => ({
    minDeposit: '0',
    minLockTime: 0,
    cooldown: 0,
    maxTime: 0,
    slope: 0,
    bias: 0,
    ...settings,
});
