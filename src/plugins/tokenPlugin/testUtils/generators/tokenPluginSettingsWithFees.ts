import type { ITokenPluginSettings, ITokenPluginSettingsEscrowSettings } from '../../types';
import { generateTokenPluginSettings } from './tokenPluginSettings';

const createEscrowSettings = (overrides?: Partial<ITokenPluginSettingsEscrowSettings>): ITokenPluginSettingsEscrowSettings => ({
    minDeposit: '0',
    minLockTime: 0,
    cooldown: 0,
    maxTime: 0,
    slope: 0,
    bias: 0,
    feePercent: 0,
    minFeePercent: 0,
    minCooldown: 0,
    ...overrides,
});

const mergeSettings = (
    base: Partial<ITokenPluginSettings> | undefined,
    escrow: ITokenPluginSettingsEscrowSettings
): Partial<ITokenPluginSettings> => {
    if (base == null) {
        return { votingEscrow: escrow };
    }

    const { votingEscrow, ...rest } = base;
    return {
        ...rest,
        votingEscrow: {
            ...escrow,
            ...votingEscrow,
        },
    };
};

export const generateTokenPluginSettingsWithDynamicFees = (settings?: Partial<ITokenPluginSettings>): ITokenPluginSettings => {
    const baseEscrow = createEscrowSettings({
        feePercent: 500,
        minFeePercent: 100,
        cooldown: 30 * 24 * 60 * 60,
        minCooldown: 2 * 24 * 60 * 60,
    });

    return generateTokenPluginSettings(mergeSettings(settings, baseEscrow));
};

export const generateTokenPluginSettingsWithTieredFees = (settings?: Partial<ITokenPluginSettings>): ITokenPluginSettings => {
    const baseEscrow = createEscrowSettings({
        feePercent: 300,
        minFeePercent: 100,
        cooldown: 30 * 24 * 60 * 60,
        minCooldown: 7 * 24 * 60 * 60,
    });

    return generateTokenPluginSettings(mergeSettings(settings, baseEscrow));
};

export const generateTokenPluginSettingsWithFixedFee = (settings?: Partial<ITokenPluginSettings>): ITokenPluginSettings => {
    const fiveDaysInSeconds = 5 * 24 * 60 * 60;
    const baseEscrow = createEscrowSettings({
        feePercent: 200,
        minFeePercent: 200,
        cooldown: fiveDaysInSeconds,
        minCooldown: fiveDaysInSeconds,
    });

    return generateTokenPluginSettings(mergeSettings(settings, baseEscrow));
};
