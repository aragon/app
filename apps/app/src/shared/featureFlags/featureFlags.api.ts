export const FEATURE_FLAG_ENVIRONMENTS = [
    'local',
    'preview',
    'development',
    'staging',
    'production',
    'occ',
] as const;

export type FeatureFlagEnvironment = (typeof FEATURE_FLAG_ENVIRONMENTS)[number];

/**
 * Environments that extend another one: a flag with no value for the environment takes the
 * value of its base. OCC (new.app.aragon.org) is production plus the flags of the soft launch.
 */
export const FEATURE_FLAG_BASE_ENVIRONMENTS: Partial<
    Record<FeatureFlagEnvironment, FeatureFlagEnvironment>
> = { occ: 'production' };

export type FeatureFlagKey =
    | 'debugPanel'
    | 'linkedAccount'
    | 'capitalFlowAutomation'
    | 'governanceDesigner'
    | 'gateAdvancedGovernance'
    | 'osxUpdates'
    | 'useMocks'
    | 'existingProposalCreationCondition'
    | 'aragonProfiles'
    | 'supportChat'
    | 'supportChatDocs'
    | 'helpCenter'
    | 'telegramSubscription'
    | 'safeAccountPage'
    | 'domainMemberList'
    | 'workspaces';

/**
 * Feature flag definition structure.
 *
 * Each feature flag must be defined in the codebase with the following properties:
 *
 * @example
 * // Example feature flag definition
 * {
 *   key: 'linkedAccount',
 *   name: 'Linked account support',
 *   description: 'Enables linked account-related features and navigation.',
 *   defaultValue: false,
 *   environments: {
 *     local: true,
 *     preview: false,
 *     production: false
 *   }
 * }
 *
 * @remarks
 * - Feature flags are defined in `featureFlags.constants.ts`
 * - CMS can override these values via `feature-flags.json`
 * - Local overrides can be set via cookies (for debugging)
 * - The final value is resolved in this order: local override > CMS override > environment-specific > default. For
 *   an environment with a base ({@link FEATURE_FLAG_BASE_ENVIRONMENTS}) the base follows each of those
 *   in turn: CMS (environment) > code (environment) > CMS (base) > code (base) > default
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
     * Supported environments: {@link FEATURE_FLAG_ENVIRONMENTS}. `occ` falls back to the
     * `production` value when it has none of its own ({@link FEATURE_FLAG_BASE_ENVIRONMENTS}).
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
    loadOverrides: () => Promise<FeatureFlagOverrides>;
    /**
     * Load the overrides of the base environment ({@link FEATURE_FLAG_BASE_ENVIRONMENTS}), which
     * rank below the code value of the environment itself. Empty without a base environment.
     */
    loadBaseOverrides?: () => Promise<FeatureFlagOverrides>;
}
