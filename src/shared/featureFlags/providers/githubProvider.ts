import type { ICmsFeatureFlagsResponse } from '@/modules/explore/api/cmsService';
import { cmsService } from '@/modules/explore/api/cmsService';
import type { FeatureFlagEnvironment, FeatureFlagOverrides, IFeatureFlagsProvider } from '../featureFlags.api';
import { parseFeatureFlagOverridesFromCookie } from '../utils/cookieOverrides';

const isRecord = (value: unknown): value is Record<string, unknown> => value != null && typeof value === 'object' && !Array.isArray(value);

const getEnvironmentValue = (value: unknown, env: FeatureFlagEnvironment): boolean | undefined => {
    if (typeof value === 'boolean') {
        // Same value across all environments.
        return value;
    }

    if (isRecord(value)) {
        const envValue = value[env];

        return typeof envValue === 'boolean' ? envValue : undefined;
    }

    return;
};

const loadCmsOverrides = async (environment: FeatureFlagEnvironment): Promise<FeatureFlagOverrides> => {
    let response: ICmsFeatureFlagsResponse;

    try {
        response = await cmsService.getFeatureFlags();
    } catch {
        // CMS is a soft dependency for flags; if it fails, fall back to static config.
        return {};
    }

    const entries = Object.entries(response).reduce<[string, boolean][]>((accumulator, [key, value]) => {
        const envValue = getEnvironmentValue(value, environment);

        if (envValue == null) {
            return accumulator;
        }

        return accumulator.concat([[key, envValue]]);
    }, []);

    return Object.fromEntries(entries) as FeatureFlagOverrides;
};

export type GithubCmsCookieSourceGetter = () => string | null | undefined | Promise<string | null | undefined>;

/**
 * Single provider implementation that merges:
 * - CMS overrides for a given environment
 * - cookie-based local overrides (for the current request/session)
 *
 * Server and client wrappers are responsible for providing the correct
 * cookie source getter; the provider itself stays agnostic of Next.js / DOM.
 */
export class GithubCmsFeatureFlagsProvider implements IFeatureFlagsProvider {
    private readonly environment: FeatureFlagEnvironment;
    private readonly getCookieSource?: GithubCmsCookieSourceGetter;

    constructor(environment: FeatureFlagEnvironment, getCookieSource?: GithubCmsCookieSourceGetter) {
        this.environment = environment;
        this.getCookieSource = getCookieSource;
    }

    loadOverrides = async (): Promise<FeatureFlagOverrides> => {
        const [cmsOverrides, cookieSource] = await Promise.all([
            loadCmsOverrides(this.environment),
            this.getCookieSource ? this.getCookieSource() : Promise.resolve<string | null | undefined>(undefined),
        ]);

        const localOverrides = parseFeatureFlagOverridesFromCookie(cookieSource);

        return { ...cmsOverrides, ...localOverrides };
    };
}
