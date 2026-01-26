import { generatePluginSettings } from '@/shared/testUtils';
import type {
    IGaugeVoterPluginSettings,
    IGaugeVoterPluginSettingsEscrowSettings,
} from '../../types/gaugeVoterPlugin';
import { generateGaugeVoterPluginSettingsToken } from './gaugeVoterPluginSettingsToken';

const createEscrowSettings = (
    overrides?: Partial<IGaugeVoterPluginSettingsEscrowSettings>,
): IGaugeVoterPluginSettingsEscrowSettings => ({
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
    base: Partial<IGaugeVoterPluginSettings> | undefined,
    escrow: IGaugeVoterPluginSettingsEscrowSettings,
): Partial<IGaugeVoterPluginSettings> => {
    if (base == null) {
        return {
            votingEscrow: escrow,
            token: generateGaugeVoterPluginSettingsToken(),
        };
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

/**
 * Generates a test GaugeVoter plugin settings with default values.
 * @param settings - Optional partial settings to override defaults.
 * @returns A complete IGaugeVoterPluginSettings object.
 */
export const generateGaugeVoterPluginSettings = (
    settings?: Partial<IGaugeVoterPluginSettings>,
): IGaugeVoterPluginSettings => {
    const baseEscrow = createEscrowSettings();
    const merged = mergeSettings(settings, baseEscrow);

    return {
        ...generatePluginSettings(),
        votingEscrow: merged.votingEscrow!,
        token: merged.token ?? generateGaugeVoterPluginSettingsToken(),
        ...merged,
    };
};

/**
 * Generates a test GaugeVoter plugin settings with dynamic fees configuration.
 * @param settings - Optional partial settings to override defaults.
 * @returns A complete IGaugeVoterPluginSettings object with dynamic fees.
 */
export const generateGaugeVoterPluginSettingsWithDynamicFees = (
    settings?: Partial<IGaugeVoterPluginSettings>,
): IGaugeVoterPluginSettings => {
    const baseEscrow = createEscrowSettings({
        feePercent: 500,
        minFeePercent: 100,
        cooldown: 30 * 24 * 60 * 60,
        minCooldown: 2 * 24 * 60 * 60,
    });

    const merged = mergeSettings(settings, baseEscrow);

    return {
        ...generatePluginSettings(),
        votingEscrow: merged.votingEscrow!,
        token: merged.token ?? generateGaugeVoterPluginSettingsToken(),
        ...merged,
    };
};

/**
 * Generates a test GaugeVoter plugin settings with tiered fees configuration.
 * @param settings - Optional partial settings to override defaults.
 * @returns A complete IGaugeVoterPluginSettings object with tiered fees.
 */
export const generateGaugeVoterPluginSettingsWithTieredFees = (
    settings?: Partial<IGaugeVoterPluginSettings>,
): IGaugeVoterPluginSettings => {
    const baseEscrow = createEscrowSettings({
        feePercent: 300,
        minFeePercent: 100,
        cooldown: 30 * 24 * 60 * 60,
        minCooldown: 7 * 24 * 60 * 60,
    });

    const merged = mergeSettings(settings, baseEscrow);

    return {
        ...generatePluginSettings(),
        votingEscrow: merged.votingEscrow!,
        token: merged.token ?? generateGaugeVoterPluginSettingsToken(),
        ...merged,
    };
};

/**
 * Generates a test GaugeVoter plugin settings with fixed fee configuration.
 * @param settings - Optional partial settings to override defaults.
 * @returns A complete IGaugeVoterPluginSettings object with fixed fee.
 */
export const generateGaugeVoterPluginSettingsWithFixedFee = (
    settings?: Partial<IGaugeVoterPluginSettings>,
): IGaugeVoterPluginSettings => {
    const fiveDaysInSeconds = 5 * 24 * 60 * 60;
    const baseEscrow = createEscrowSettings({
        feePercent: 200,
        minFeePercent: 200,
        cooldown: fiveDaysInSeconds,
        minCooldown: fiveDaysInSeconds,
    });

    const merged = mergeSettings(settings, baseEscrow);

    return {
        ...generatePluginSettings(),
        votingEscrow: merged.votingEscrow!,
        token: merged.token ?? generateGaugeVoterPluginSettingsToken(),
        ...merged,
    };
};
