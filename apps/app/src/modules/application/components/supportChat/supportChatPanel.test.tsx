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
    });

    it('renders nothing when the support chat flag is disabled', () => {
        setSupportChatEnabled(false);
        const { container } = render(<SupportChatPanel />);
        expect(container).toBeEmptyDOMElement();
    });

    it('keeps the panel mounted but inert while closed', () => {
        setContextOpen(false);
        const { container } = render(<SupportChatPanel />);

        const panel = container.querySelector('aside');
        expect(panel).toBeInTheDocument();
        expect(panel).toHaveAttribute('inert');
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
});
