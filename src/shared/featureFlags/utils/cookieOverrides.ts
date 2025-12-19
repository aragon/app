import type { FeatureFlagKey, FeatureFlagOverrides } from '../featureFlags.api';
import {
    FEATURE_FLAG_DEFINITIONS,
    FEATURE_FLAGS_OVERRIDES_COOKIE_NAME,
} from '../featureFlags.constants';

export const parseFeatureFlagOverridesFromCookie = (
    cookieSource?: string | null,
): FeatureFlagOverrides => {
    if (!cookieSource) {
        return {};
    }

    try {
        const cookies = cookieSource.split(';').map((item) => item.trim());
        const overridesCookie = cookies.find((item) =>
            item.startsWith(`${FEATURE_FLAGS_OVERRIDES_COOKIE_NAME}=`),
        );

        if (!overridesCookie) {
            return {};
        }

        const [, rawValue] = overridesCookie.split('=', 2);

        if (!rawValue) {
            return {};
        }

        const decoded = decodeURIComponent(rawValue);
        const parsed = JSON.parse(decoded) as Record<string, unknown>;

        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
            return {};
        }

        const result: FeatureFlagOverrides = {};

        for (const [key, val] of Object.entries(parsed)) {
            if (
                typeof val === 'boolean' &&
                FEATURE_FLAG_DEFINITIONS.some((item) => item.key === key)
            ) {
                result[key as FeatureFlagKey] = val;
            }
        }

        return result;
    } catch {
        return {};
    }
};

export const serializeFeatureFlagOverridesToCookie = (
    overrides: FeatureFlagOverrides,
): string => {
    const encoded = encodeURIComponent(JSON.stringify(overrides));

    return `${FEATURE_FLAGS_OVERRIDES_COOKIE_NAME}=${encoded}; path=/; max-age=31536000`;
};
