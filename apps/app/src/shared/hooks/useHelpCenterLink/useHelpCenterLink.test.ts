import { renderHook } from '@testing-library/react';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import { useHelpCenterLink } from './useHelpCenterLink';

describe('useHelpCenterLink hook', () => {
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    const mockHelpCenter = (enabled: boolean) => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: (key: string) => key === 'helpCenter' && enabled,
        } as unknown as ReturnType<
            typeof featureFlagsProvider.useFeatureFlags
        >);
    };

    afterEach(() => {
        useFeatureFlagsSpy.mockReset();
    });

    const link = {
        path: '/governance/process#staged-governance-processes',
        fallback: 'https://docs.aragon.org/spp/1.x/index.html',
    };

    it('returns the help-center route while the helpCenter flag serves the site', () => {
        mockHelpCenter(true);

        const { result } = renderHook(() => useHelpCenterLink(link));

        expect(result.current).toBe(
            '/help/governance/process#staged-governance-processes',
        );
    });

    it('returns the developer-portal fallback otherwise', () => {
        mockHelpCenter(false);

        const { result } = renderHook(() => useHelpCenterLink(link));

        expect(result.current).toBe(link.fallback);
    });
});
