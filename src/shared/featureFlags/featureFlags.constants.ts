import type { FeatureFlagDefinition } from './featureFlags.api';

export const FEATURE_FLAGS_OVERRIDES_COOKIE_NAME =
    'aragon.featureFlags.overrides';

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
            development: true,
            preview: true,
        },
    },
    {
        key: 'subDao',
        name: 'SubDAO support',
        description: 'Enables SubDAO-related features and navigation.',
        defaultValue: false,
        environments: {
            local: true,
        },
    },
    {
        key: 'governanceDesigner',
        name: 'Governance designer',
        description: 'Enables governance designer and admin member features',
        defaultValue: false,
        environments: {
            local: true,
            development: true,
            preview: true,
            staging: true,
            production: true,
        },
    },
    {
        key: 'osxUpdates',
        name: 'OSX updates',
        description: 'Enables DAO contract upgrade functionality',
        defaultValue: false,
        environments: {
            local: true,
            development: true,
            preview: true,
            staging: true,
            production: true,
        },
    },
    {
        key: 'useMocks',
        name: 'Use mocks',
        description:
            'Enables API mocking via fetch interceptor for development',
        defaultValue: false,
        environments: {
            local: true,
            development: true,
            preview: true,
        },
    },
    {
        key: 'enableAllPlugins',
        name: 'Enable all plugins',
        description:
            'Enables all plugins for DAO creation flows, bypassing whitelist validation',
        defaultValue: false,
        environments: {
            local: true,
            development: true,
            preview: true,
        },
    },
];
