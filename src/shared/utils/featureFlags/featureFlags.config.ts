import { FEATURE_FLAG_ENVIRONMENTS, type FeatureFlagDefinition, type FeatureFlagEnvironment } from './featureFlags.api';

const resolveEnvironment = (): FeatureFlagEnvironment => {
    const rawEnv = process.env.NEXT_PUBLIC_ENV;

    if (rawEnv != null && FEATURE_FLAG_ENVIRONMENTS.includes(rawEnv as FeatureFlagEnvironment)) {
        return rawEnv as FeatureFlagEnvironment;
    }

    // Fail-safe: treat unknown/missing environment as production to avoid
    // accidentally enabling flags in non-explicit environments.
    return 'production';
};

const CURRENT_ENV = resolveEnvironment();

/**
 * Feature flags definitions.
 *
 * Each feature flag must include:
 * - key: Unique identifier (must be added to FeatureFlagKey type)
 * - name: Human-readable name for UI
 * - description: What the flag controls
 * - defaultValue: Default value when no environment override is set
 * - environments: Optional environment-specific values
 *
 * @example
 * {
 *   key: 'myFeature',
 *   name: 'My Feature',
 *   description: 'Enables my new feature.',
 *   defaultValue: false,
 *   environments: {
 *     local: true,
 *     preview: true,
 *     production: false
 *   }
 * }
 *
 * @see {@link FeatureFlagDefinition} for detailed structure
 * @see {@link ICmsFeatureFlagsResponse} for CMS override format
 */
export const FEATURE_FLAG_DEFINITIONS: FeatureFlagDefinition[] = [
    {
        key: 'debugPanel',
        name: 'Debug panel',
        description: 'Enables the in-app debug panel for developers.',
        defaultValue: false,
        environments: {
            local: true,
            preview: true,
            production: false,
        },
    },
    {
        key: 'subDao',
        name: 'SubDAO support',
        description: 'Enables SubDAO-related features and navigation.',
        defaultValue: false,
        environments: {
            local: true,
            preview: false,
            production: false,
        },
    },
];

export const getEnvironment = (): FeatureFlagEnvironment => CURRENT_ENV;
