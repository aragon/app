import type { FeatureFlagEnvironment } from '../featureFlags.api';

/**
 * Returns the boolean entry of the environment in a per-environment map; a missing or non-boolean
 * entry gives `undefined`.
 */
export const getEnvironmentValue = (
    values: Partial<Record<string, unknown>> | undefined,
    env: FeatureFlagEnvironment,
): boolean | undefined => {
    const value = values?.[env];

    return typeof value === 'boolean' ? value : undefined;
};
