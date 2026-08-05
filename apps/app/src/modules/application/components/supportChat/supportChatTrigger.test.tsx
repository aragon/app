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

    const setContext = (isOpen: boolean, open = jest.fn()) => {
        useSupportChatContextSpy.mockReturnValue({
            isOpen,
            open,
            close: jest.fn(),
            toggle: jest.fn(),
        });
        return open;
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

    it('renders an open button and opens the chat on click', async () => {
        const open = setContext(false);
        render(<SupportChatTrigger />);

        const button = screen.getByRole('button', {
            name: /supportChat.trigger.open/,
        });
        await userEvent.click(button);
        expect(open).toHaveBeenCalled();
    });

    it('withdraws while the chat is open, which closes through the panel itself', () => {
        setContext(true);
        render(<SupportChatTrigger />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
