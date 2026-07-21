import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import * as supportChatContext from './supportChatContext';
import { SupportChatTrigger } from './supportChatTrigger';

describe('<SupportChatTrigger /> component', () => {
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

    const setContext = (isOpen: boolean, toggle = jest.fn()) => {
        useSupportChatContextSpy.mockReturnValue({
            isOpen,
            open: jest.fn(),
            close: jest.fn(),
            toggle,
        });
        return toggle;
    };

    beforeEach(() => {
        setSupportChatEnabled(true);
        setContext(false);
    });

    afterEach(() => {
        useFeatureFlagsSpy.mockReset();
        useSupportChatContextSpy.mockReset();
    });

    it('renders nothing when the support chat flag is disabled', () => {
        setSupportChatEnabled(false);
        render(<SupportChatTrigger />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders an open button and toggles the chat on click', async () => {
        const toggle = setContext(false);
        render(<SupportChatTrigger />);

        const button = screen.getByRole('button', {
            name: /supportChat.trigger.open/,
        });
        await userEvent.click(button);
        expect(toggle).toHaveBeenCalled();
    });

    it('renders a close button while the chat is open', () => {
        setContext(true);
        render(<SupportChatTrigger />);
        expect(
            screen.getByRole('button', { name: /supportChat.trigger.close/ }),
        ).toBeInTheDocument();
    });
});
