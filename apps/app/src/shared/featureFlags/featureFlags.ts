import { headers } from 'next/headers';
import { cache } from 'react';
import type {
    FeatureFlagDefinition,
    FeatureFlagEnvironment,
    FeatureFlagKey,
    FeatureFlagOverrides,
    FeatureFlagSnapshot,
    IFeatureFlagsProvider,
} from './featureFlags.api';
import { FEATURE_FLAG_DEFINITIONS } from './featureFlags.constants';
import {
    type GithubCmsCookieSourceGetter,
    GithubCmsFeatureFlagsProvider,
} from './providers/githubProvider';
import { getEnvironment } from './utils/getEnvironment';

const getStaticDefaultValue = (
    definition: FeatureFlagDefinition,
    env: FeatureFlagEnvironment,
): boolean => {
    const envValue = definition.environments?.[env];
    if (envValue != null) {
        return envValue;
    }

    return definition.defaultValue;
};

const resolveFlagValue = (
    definition: FeatureFlagDefinition,
    overrides: FeatureFlagOverrides,
    env: FeatureFlagEnvironment,
): boolean => {
    if (overrides[definition.key] != null) {
        return overrides[definition.key] === true;
    }

    return getStaticDefaultValue(definition, env);
};

class FeatureFlags {
    private provider: IFeatureFlagsProvider;
    private definitions: FeatureFlagDefinition[];
    private environment: FeatureFlagEnvironment;

    /**
     * Stateless feature flags service.
     *
     * All storage specific logic is delegated to the provider.
     * This allows us to easily swap providers (GitHub CMS, LaunchDarkly, etc.)
     * without touching the public API. The effective environment is provided
     * explicitly by the caller.
     */
    constructor(
        provider: IFeatureFlagsProvider,
        definitions: FeatureFlagDefinition[],
        environment: FeatureFlagEnvironment,
    ) {
        this.provider = provider;
        this.definitions = definitions;
        this.environment = environment;

        this.getSnapshotInternal = cache(this.getSnapshotInternal.bind(this));
    }

    /**
     * Deduplicated per React server render pass via React.cache: multiple
     * getSnapshot / isEnabled calls within the same request share a single
     * CMS fetch instead of triggering one per call.
     */
    private async getSnapshotInternal(): Promise<FeatureFlagSnapshot[]> {
        const overrides = await this.provider.loadOverrides();

        return this.definitions.map((definition) => ({
            key: definition.key,
            name: definition.name,
            description: definition.description,
            enabled: resolveFlagValue(definition, overrides, this.environment),
        }));
    }

    /**
     * Check if a feature flag is enabled.
     *
     * This method is intended to be used on the server only. For client-side
     * checks, prefer the `FeatureFlagsProvider` context, which receives a
     * server-resolved snapshot.
     *
     * @param key - Feature flag key
     */
    isEnabled = async (key: FeatureFlagKey): Promise<boolean> => {
        try {
            const snapshot = await this.getSnapshotInternal();
            const flag = snapshot.find((item) => item.key === key);

            if (flag == null) {
                return false;
            }

            return flag.enabled;
        } catch {
            return false;
        }
    };

    /**
     * Get a snapshot of all feature flags.
     */
    getSnapshot = async (): Promise<FeatureFlagSnapshot[]> => {
        try {
            return await this.getSnapshotInternal();
        } catch {
            return this.definitions.map((definition) => ({
                key: definition.key,
                name: definition.name,
                description: definition.description,
                enabled: false,
            }));
        }
    };
}

/**
 * Feature flags service over the code definitions, the CMS overrides of the current environment
 * and the local overrides in the cookies the caller reads for it — for the proxy, which runs
 * before `headers()` is available.
 */
export const createFeatureFlags = (
    getCookieSource: GithubCmsCookieSourceGetter,
): FeatureFlags => {
    const environment = getEnvironment();

    return new FeatureFlags(
        new GithubCmsFeatureFlagsProvider(environment, getCookieSource),
        FEATURE_FLAG_DEFINITIONS,
        environment,
    );
};

/**
 * Server-only feature flags service.
 *
 * All storage specific logic is delegated to the provider.
 * This allows us to easily swap providers (GitHub CMS, LaunchDarkly, etc.)
 * without touching the public API. The effective environment is provided
 * explicitly by the caller.
 */
export const featureFlags = createFeatureFlags(async () => {
    const h = await headers();
    return h.get('cookie');
});
