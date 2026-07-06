import {
    FEATURE_FLAG_ENVIRONMENTS,
    type FeatureFlagEnvironment,
} from '../featureFlags.api';

const resolveEnvironment = (
    rawEnv: string | undefined,
): FeatureFlagEnvironment => {
    if (
        rawEnv != null &&
        FEATURE_FLAG_ENVIRONMENTS.includes(rawEnv as FeatureFlagEnvironment)
    ) {
        return rawEnv as FeatureFlagEnvironment;
    }

    // Fail-safe: treat unknown/missing environment as production to avoid
    // accidentally enabling flags in non-explicit environments.
    return 'production';
};

export const getEnvironment = (): FeatureFlagEnvironment =>
    resolveEnvironment(process.env.NEXT_PUBLIC_ENV);
