import { render, screen } from '@testing-library/react';
import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import * as headers from 'next/headers';
import type { ReactNode } from 'react';
import * as wagmi from 'wagmi';
import { spacingPreviewUtils } from '@/modules/application/utils/spacingPreviewUtils';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import { translations } from '@/shared/constants/translations';
import { featureFlags } from '@/shared/featureFlags';
import { testLogger } from '@/test/utils';
import { type ILayoutRootProps, LayoutRoot } from './layoutRoot';

jest.mock('@vercel/analytics/next', () => ({ Analytics: () => null }));
jest.mock('@vercel/speed-insights/next', () => ({
    SpeedInsights: () => null,
}));

jest.mock('../../debugPanel/lazyDebugPanel', () => ({
    DebugPanelLazy: () => null,
}));

jest.mock('../../providers', () => ({
    Providers: (props: {
        translations: unknown;
        wagmiInitialState: unknown;
        children: ReactNode;
    }) => (
        <div
            data-testid="providers-mock"
            data-translations={JSON.stringify(props.translations)}
            data-wagmistate={props.wagmiInitialState}
        >
            {props.children}
        </div>
    ),
}));

describe('<LayoutRoot /> component', () => {
    const cookieToInitialStateSpy = jest.spyOn(wagmi, 'cookieToInitialState');
    const headersSpy = jest.spyOn(headers, 'headers');
    const getSnapshotSpy = jest.spyOn(featureFlags, 'getSnapshot');
    const { getServerSpacingAttribute } = spacingPreviewUtils;
    const getServerSpacingAttributeSpy = jest.spyOn(
        spacingPreviewUtils,
        'getServerSpacingAttribute',
    );

    // The Providers component is mocked, so the footer renders without a FeatureFlagsProvider.
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    beforeEach(() => {
        // Suppress "<html> cannot appear as a child of <div>" warnings.
        // To be fixed by React 19 migration (see https://github.com/testing-library/react-testing-library/issues/1250)
        testLogger.suppressErrors();
        headersSpy.mockReturnValue({
            get: jest.fn(),
        } as unknown as Promise<ReadonlyHeaders>);
        getSnapshotSpy.mockResolvedValue([]);
        getServerSpacingAttributeSpy.mockImplementation(
            getServerSpacingAttribute,
        );
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: () => false,
        } as unknown as ReturnType<
            typeof featureFlagsProvider.useFeatureFlags
        >);
    });

    afterEach(() => {
        cookieToInitialStateSpy.mockReset();
        headersSpy.mockReset();
        useFeatureFlagsSpy.mockReset();
        getSnapshotSpy.mockReset();
        getServerSpacingAttributeSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<ILayoutRootProps>) => {
        const completeProps: ILayoutRootProps = { ...props };
        const Component = await LayoutRoot(completeProps);

        return Component;
    };

    it('renders the children property and the application footer', async () => {
        const children = 'test-children';
        render(await createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
        expect(screen.getByText(/footer.link.explore/)).toBeInTheDocument();
    });

    it('renders the providers components and passes the english translations', async () => {
        const assets = await translations.en();
        render(await createTestComponent());
        const providers = screen.getByTestId('providers-mock');
        expect(providers).toBeInTheDocument();
        expect(providers.dataset.translations).toEqual(JSON.stringify(assets));
    });

    it('displays an error feedback but displays the footer if an error is thrown by a children component', async () => {
        testLogger.suppressErrors();
        const Children = () => {
            throw new Error('Test error');
        };

        render(await createTestComponent({ children: <Children /> }));
        expect(screen.getByText(/footer.link.explore/)).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('retrieves and passes the wagmi initial state to the providers component', async () => {
        const initialState = 'test' as unknown as wagmi.State;
        cookieToInitialStateSpy.mockReturnValue(initialState);
        render(await createTestComponent());
        const providers = screen.getByTestId('providers-mock');
        expect(providers.dataset.wagmistate).toEqual(initialState);
    });

    it.each([true, false])(
        'resolves the previewed spacing from the request cookies with the debug panel enabled: %s',
        async (enabled) => {
            const cookie = `${spacingPreviewUtils.cookieName}=compact`;
            headersSpy.mockReturnValue({
                get: (name: string) => (name === 'cookie' ? cookie : null),
            } as unknown as Promise<ReadonlyHeaders>);
            getSnapshotSpy.mockResolvedValue([
                {
                    key: 'debugPanel',
                    name: 'Debug panel',
                    description: '',
                    enabled,
                },
            ]);

            render(await createTestComponent());

            expect(getServerSpacingAttributeSpy).toHaveBeenCalledWith(
                enabled,
                cookie,
            );
        },
    );

    it.each([
        [true, 'compact'],
        [false, null],
    ])(
        'renders data-spacing from a stored cookie only with the debug panel enabled (%s)',
        async (enabled, expected) => {
            const cookie = `${spacingPreviewUtils.cookieName}=compact`;
            headersSpy.mockReturnValue({
                get: (name: string) => (name === 'cookie' ? cookie : null),
            } as unknown as Promise<ReadonlyHeaders>);
            getSnapshotSpy.mockResolvedValue([
                {
                    key: 'debugPanel',
                    name: 'Debug panel',
                    description: '',
                    enabled,
                },
            ]);

            cookieToInitialStateSpy.mockReturnValue(undefined);

            render(await createTestComponent());

            // React renders <html> as the document's root singleton.
            expect(
                document.documentElement.getAttribute('data-spacing'),
            ).toEqual(expected);
        },
    );
});
