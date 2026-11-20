import type { ICmsFeatureFlagsResponse } from '@/shared/api/cmsService';
import { cmsService } from '@/shared/api/cmsService';
import type {
    FeatureFlagEnvironment,
    FeatureFlagOverrides,
} from '../featureFlags.api';
import { parseFeatureFlagOverridesFromCookie } from '../utils/cookieOverrides';
import { GithubCmsFeatureFlagsProvider } from './githubProvider';

jest.mock('@/shared/api/cmsService', () => ({
    cmsService: {
        getFeatureFlags: jest.fn(),
    },
}));

jest.mock('../utils/cookieOverrides', () => ({
    parseFeatureFlagOverridesFromCookie: jest.fn(),
}));

describe('GithubCmsFeatureFlagsProvider', () => {
    const mockedCmsService = cmsService as jest.Mocked<typeof cmsService>;
    const parseOverridesMock =
        parseFeatureFlagOverridesFromCookie as jest.MockedFunction<
            typeof parseFeatureFlagOverridesFromCookie
        >;

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('merges CMS overrides and cookie overrides with cookie taking precedence', async () => {
        const cmsResponse: ICmsFeatureFlagsResponse = {
            debugPanel: {
                local: false,
                production: false,
            },
        };

        mockedCmsService.getFeatureFlags.mockResolvedValueOnce(cmsResponse);
        parseOverridesMock.mockReturnValueOnce({ debugPanel: true });

        const provider = new GithubCmsFeatureFlagsProvider(
            'local',
            () => 'cookie',
        );

        const result = await provider.loadOverrides();

        const expected: FeatureFlagOverrides = { debugPanel: true };

        expect(mockedCmsService.getFeatureFlags).toHaveBeenCalledTimes(1);
        expect(parseOverridesMock).toHaveBeenCalledWith('cookie');
        expect(result).toEqual(expected);
    });

    describe('occ environment', () => {
        const loadOverrides = (
            cmsResponse: ICmsFeatureFlagsResponse,
            environment: FeatureFlagEnvironment,
        ) => {
            mockedCmsService.getFeatureFlags.mockResolvedValueOnce(cmsResponse);
            parseOverridesMock.mockReturnValueOnce({});

            return new GithubCmsFeatureFlagsProvider(
                environment,
                () => 'cookie',
            ).loadOverrides();
        };

        const loadBaseOverrides = (
            cmsResponse: ICmsFeatureFlagsResponse,
            environment: FeatureFlagEnvironment,
        ) => {
            mockedCmsService.getFeatureFlags.mockResolvedValueOnce(cmsResponse);

            return new GithubCmsFeatureFlagsProvider(
                environment,
            ).loadBaseOverrides();
        };

        it('loads only the own CMS value of occ as override', async () => {
            const result = await loadOverrides(
                {
                    debugPanel: { production: true },
                    linkedAccount: { occ: true, production: false },
                },
                'occ',
            );

            expect(result).toEqual({ linkedAccount: true });
        });

        it('loads the production CMS values as base overrides of occ', async () => {
            const result = await loadBaseOverrides(
                {
                    debugPanel: { production: true },
                    linkedAccount: { occ: true, production: false },
                    useMocks: { occ: true },
                },
                'occ',
            );

            expect(result).toEqual({
                debugPanel: true,
                linkedAccount: false,
            });
        });

        it('loads no base overrides in an environment without a base', async () => {
            const result = await loadBaseOverrides(
                { debugPanel: { production: true } },
                'staging',
            );

            expect(result).toEqual({});
            expect(mockedCmsService.getFeatureFlags).not.toHaveBeenCalled();
        });

        it('applies the plain boolean format to occ', async () => {
            const result = await loadOverrides({ debugPanel: true }, 'occ');

            expect(result).toEqual({ debugPanel: true });
        });

        it('does not inherit production values in other environments', async () => {
            const result = await loadOverrides(
                { debugPanel: { production: true } },
                'staging',
            );

            expect(result).toEqual({});
        });
    });

    it('returns only cookie overrides when CMS call fails', async () => {
        mockedCmsService.getFeatureFlags.mockRejectedValueOnce(
            new Error('network error'),
        );
        parseOverridesMock.mockReturnValueOnce({ linkedAccount: true });

        const provider = new GithubCmsFeatureFlagsProvider(
            'local',
            () => 'cookie',
        );

        const result = await provider.loadOverrides();

        expect(result).toEqual<FeatureFlagOverrides>({ linkedAccount: true });
    });
});
