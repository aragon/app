import type { FeatureFlagKey, FeatureFlagOverrides } from '../featureFlags.api';
import { FEATURE_FLAGS_OVERRIDES_COOKIE_NAME } from '../featureFlags.constants';
import { parseFeatureFlagOverridesFromCookie, serializeFeatureFlagOverridesToCookie } from './cookieOverrides';

describe('feature flags cookies utils', () => {
    describe('serializeFeatureFlagOverridesToCookie', () => {
        it('serializes overrides object to cookie string', () => {
            const overrides: FeatureFlagOverrides = { debugPanel: true, subDao: false };

            const result = serializeFeatureFlagOverridesToCookie(overrides);

            expect(result.startsWith(`${FEATURE_FLAGS_OVERRIDES_COOKIE_NAME}=`)).toBe(true);
            const [, rawValue] = result.split('=', 2);
            const [encodedJson] = rawValue.split(';', 1);

            const decoded = decodeURIComponent(encodedJson);
            expect(JSON.parse(decoded)).toEqual(overrides);
        });
    });

    describe('parseFeatureFlagOverridesFromCookie', () => {
        it('returns empty object when cookie source is empty', () => {
            expect(parseFeatureFlagOverridesFromCookie(undefined)).toEqual({});
            expect(parseFeatureFlagOverridesFromCookie(null)).toEqual({});
            expect(parseFeatureFlagOverridesFromCookie('')).toEqual({});
        });

        it('parses valid overrides cookie and filters unknown keys', () => {
            const overrides: FeatureFlagOverrides = { debugPanel: true };
            const cookieString = serializeFeatureFlagOverridesToCookie({
                ...overrides,
                ['unknownFlag' as FeatureFlagKey]: true,
            });

            const result = parseFeatureFlagOverridesFromCookie(cookieString);

            expect(result).toEqual(overrides);
        });

        it('returns empty object on invalid JSON', () => {
            const invalidCookie = `${FEATURE_FLAGS_OVERRIDES_COOKIE_NAME}=invalid%7Bjson`;

            const result = parseFeatureFlagOverridesFromCookie(invalidCookie);

            expect(result).toEqual({});
        });
    });
});
