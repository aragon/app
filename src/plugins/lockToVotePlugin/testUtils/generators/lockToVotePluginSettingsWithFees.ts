import type { ILockToVotePluginSettings } from '../../types';
import { generateLockToVotePluginSettings } from './lockToVotePluginSettings';

/**
 * Generates lock-to-vote plugin settings with dynamic fee configuration.
 * @param settings - Optional partial settings to override defaults.
 * @returns Plugin settings with dynamic fee system configured.
 */
export const generateLockToVotePluginSettingsWithDynamicFees = (
    settings?: Partial<ILockToVotePluginSettings>,
): ILockToVotePluginSettings => {
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    const twoDaysInSeconds = 2 * 24 * 60 * 60;

    return generateLockToVotePluginSettings({
        feePercent: 500, // 5% in basis points
        minFeePercent: 100, // 1% in basis points
        cooldown: thirtyDaysInSeconds,
        minCooldown: twoDaysInSeconds,
        ...settings,
    });
};

/**
 * Generates lock-to-vote plugin settings with tiered fee configuration.
 * @param settings - Optional partial settings to override defaults.
 * @returns Plugin settings with tiered fee system configured.
 */
export const generateLockToVotePluginSettingsWithTieredFees = (
    settings?: Partial<ILockToVotePluginSettings>,
): ILockToVotePluginSettings => {
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    const oneDayInSeconds = 24 * 60 * 60;

    return generateLockToVotePluginSettings({
        feePercent: 300, // 3% early exit fee
        minFeePercent: 100, // 1% normal fee
        cooldown: sevenDaysInSeconds,
        minCooldown: oneDayInSeconds,
        ...settings,
    });
};

/**
 * Generates lock-to-vote plugin settings with fixed fee configuration.
 * @param settings - Optional partial settings to override defaults.
 * @returns Plugin settings with fixed fee system configured.
 */
export const generateLockToVotePluginSettingsWithFixedFee = (
    settings?: Partial<ILockToVotePluginSettings>,
): ILockToVotePluginSettings => {
    const fiveDaysInSeconds = 5 * 24 * 60 * 60;

    return generateLockToVotePluginSettings({
        feePercent: 200, // 2% fixed fee
        minFeePercent: 200, // Same as feePercent for fixed mode
        cooldown: fiveDaysInSeconds,
        minCooldown: fiveDaysInSeconds, // Same as cooldown for fixed mode
        ...settings,
    });
};
