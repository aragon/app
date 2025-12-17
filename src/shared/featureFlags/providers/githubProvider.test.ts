import type { ICmsFeatureFlagsResponse } from '@/modules/explore/api/cmsService';
import { cmsService } from '@/modules/explore/api/cmsService';
import type { FeatureFlagOverrides } from '../featureFlags.api';
import { parseFeatureFlagOverridesFromCookie } from '../utils/cookieOverrides';
import { GithubCmsFeatureFlagsProvider } from './githubProvider';

jest.mock('@/modules/explore/api/cmsService', () => ({
    cmsService: {
        getFeatureFlags: jest.fn(),
    },
}));

jest.mock('../utils/cookieOverrides', () => ({
    parseFeatureFlagOverridesFromCookie: jest.fn(),
}));

describe('GithubCmsFeatureFlagsProvider', () => {
    const mockedCmsService = cmsService as jest.Mocked<typeof cmsService>;
    const parseOverridesMock = parseFeatureFlagOverridesFromCookie as jest.MockedFunction<typeof parseFeatureFlagOverridesFromCookie>;

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

        const provider = new GithubCmsFeatureFlagsProvider('local', () => 'cookie');

        const result = await provider.loadOverrides();

        const expected: FeatureFlagOverrides = { debugPanel: true };

        expect(mockedCmsService.getFeatureFlags).toHaveBeenCalledTimes(1);
        expect(parseOverridesMock).toHaveBeenCalledWith('cookie');
        expect(result).toEqual(expected);
    });

    it('returns only cookie overrides when CMS call fails', async () => {
        mockedCmsService.getFeatureFlags.mockRejectedValueOnce(new Error('network error'));
        parseOverridesMock.mockReturnValueOnce({ subDao: true });

        const provider = new GithubCmsFeatureFlagsProvider('local', () => 'cookie');

        const result = await provider.loadOverrides();

        expect(result).toEqual<FeatureFlagOverrides>({ subDao: true });
    });
});
