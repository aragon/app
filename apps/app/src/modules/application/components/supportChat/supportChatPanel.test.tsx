import { render, screen } from '@testing-library/react';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import * as supportChatContext from './supportChatContext';
import { SupportChatPanel } from './supportChatPanel';

jest.mock('./supportChat', () => ({
    SupportChat: () => <div data-testid="support-chat-mock" />,
}));

describe('<SupportChatPanel /> component', () => {
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    const useSupportChatContextSpy = jest.spyOn(
        supportChatContext,
        'useSupportChatContext',
    );

    const setSupportChatEnabled = (enabled: boolean) => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: (key) => key === 'supportChat' && enabled,
        } as ReturnType<typeof featureFlagsProvider.useFeatureFlags>);
    };

    const setContextOpen = (isOpen: boolean) => {
        useSupportChatContextSpy.mockReturnValue({
            isOpen,
            open: jest.fn(),
            close: jest.fn(),
            toggle: jest.fn(),
        });
    };

    beforeEach(() => {
        setSupportChatEnabled(true);
        setContextOpen(false);
    });

    afterEach(() => {
        useFeatureFlagsSpy.mockReset();
        useSupportChatContextSpy.mockReset();
        Reflect.deleteProperty(window, 'matchMedia');
    });

    it('renders nothing when the support chat flag is disabled', () => {
        setSupportChatEnabled(false);
        const { container } = render(<SupportChatPanel />);
        expect(container).toBeEmptyDOMElement();
    });

    it('keeps the panel mounted but inert and hidden from assistive technology while closed', () => {
        setContextOpen(false);
        const { container } = render(<SupportChatPanel />);

        const panel = container.querySelector('aside');
        expect(panel).toBeInTheDocument();
        expect(panel).toHaveAttribute('inert');
        expect(panel).toHaveAttribute('aria-hidden', 'true');
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
        expect(screen.getByTestId('support-chat-mock')).toBeInTheDocument();
    });

    it('exposes the panel to assistive technology while open', () => {
        setContextOpen(true);
        const { container } = render(<SupportChatPanel />);

        const panel = container.querySelector('aside');
        expect(panel).not.toHaveAttribute('inert');
        expect(
            screen.getByRole('complementary', {
                name: /supportChat.panel.label/,
            }),
        ).toBeInTheDocument();
    });

    it('makes the covered app column inert while open below the desktop breakpoint', () => {
        const matchMediaSpy = jest.fn().mockReturnValue({
            matches: false,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        });
        window.matchMedia =
            matchMediaSpy as unknown as typeof window.matchMedia;

        setContextOpen(true);
        const { rerender } = render(
            <div className="flex">
                <div data-testid="app-column" />
                <SupportChatPanel />
            </div>,
        );
        expect(screen.getByTestId('app-column')).toHaveAttribute('inert');

        setContextOpen(false);
        rerender(
            <div className="flex">
                <div data-testid="app-column" />
                <SupportChatPanel />
            </div>,
        );
        expect(screen.getByTestId('app-column')).not.toHaveAttribute('inert');
    });

    it('leaves the app column interactive while open on desktop', () => {
        const matchMediaSpy = jest.fn().mockReturnValue({
            matches: true,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        });
        window.matchMedia =
            matchMediaSpy as unknown as typeof window.matchMedia;

        setContextOpen(true);
        render(
            <div className="flex">
                <div data-testid="app-column" />
                <SupportChatPanel />
            </div>,
        );

        expect(screen.getByTestId('app-column')).not.toHaveAttribute('inert');
    });
});
