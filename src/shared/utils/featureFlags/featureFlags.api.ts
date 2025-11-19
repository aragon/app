export const FEATURE_FLAG_ENVIRONMENTS = ['local', 'preview', 'development', 'staging', 'production'] as const;

export type FeatureFlagEnvironment = (typeof FEATURE_FLAG_ENVIRONMENTS)[number];

export type FeatureFlagKey = 'debugPanel' | 'subDao';

/**
 * Feature flag definition structure.
 *
 * Each feature flag must be defined in the codebase with the following properties:
 *
 * @example
 * // Example feature flag definition
 * {
 *   key: 'subDao',
 *   name: 'SubDAO support',
 *   description: 'Enables SubDAO-related features and navigation.',
 *   defaultValue: false,
 *   environments: {
 *     local: true,
 *     preview: false,
 *     production: false
 *   }
 * }
 *
 * @remarks
 * - Feature flags are defined in `featureFlags.config.ts`
 * - CMS can override these values via `feature-flags.json`
 * - Local overrides can be set via cookies (for debugging)
 * - The final value is resolved in this order: local override > CMS override > environment-specific > default
 */
export interface FeatureFlagDefinition {
    /**
     * Unique identifier for the feature flag.
     * Must match the key used in CMS and be a valid FeatureFlagKey.
     */
    key: FeatureFlagKey;
    /**
     * Human-readable name, used in debug tools and UI.
     */
    name: string;
    /**
     * Description of what the flag controls and its purpose.
     */
    description: string;
    /**
     * Default value applied when no environment-specific value is set.
     */
    defaultValue: boolean;
    /**
     * Environment-specific overrides.
     * Supported environments: {@link FEATURE_FLAG_ENVIRONMENTS}
     */
    environments?: Partial<Record<FeatureFlagEnvironment, boolean>>;
}

export type FeatureFlagOverrides = Partial<Record<FeatureFlagKey, boolean>>;

export interface FeatureFlagSnapshot {
    key: FeatureFlagKey;
    name: string;
    description: string;
    enabled: boolean;
}

/**
 * Provider responsible for loading feature flag overrides from a concrete storage
 * (CMS, third-party services, storages, etc.) for a given environment.
 *
 * The provider fully encapsulates all I/O details (CMS, cookies, third-party
 * services, etc.), while the feature flags service stays pure and stateless.
 */
export interface IFeatureFlagsProvider {
    /**
     * Load all overrides for the current request/session/context.
     *
     * NOTE: Implementation is intentionally stateless from the service
     * perspective. Any per-request details (cookies, headers, etc.) must be
     * resolved inside this method.
     */
    loadOverrides(): Promise<FeatureFlagOverrides>;
}
