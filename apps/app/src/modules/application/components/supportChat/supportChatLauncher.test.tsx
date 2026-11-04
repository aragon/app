import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import * as supportChatContext from './supportChatContext';
import { SupportChatLauncher } from './supportChatLauncher';

describe('<SupportChatLauncher /> component', () => {
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

    const launcherName = /supportChat.launcher.label/;

    beforeEach(() => {
        setSupportChatEnabled(true);
        setContext(false);
    });

    afterEach(() => {
        useFeatureFlagsSpy.mockReset();
        useSupportChatContextSpy.mockReset();
    });

    it('opens the chat on click', async () => {
        const open = setContext(false);
        render(<SupportChatLauncher />);

        await userEvent.click(
            screen.getByRole('button', { name: launcherName }),
        );
        expect(open).toHaveBeenCalled();
    });

    it('withdraws while the chat is open and when the support chat flag is off', () => {
        setContext(true);
        const { rerender } = render(<SupportChatLauncher />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();

        setContext(false);
        setSupportChatEnabled(false);
        rerender(<SupportChatLauncher />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('comes back with focus once the chat is closed from the panel', () => {
        setContext(true);
        const { rerender } = render(<SupportChatLauncher />);

        setContext(false);
        rerender(<SupportChatLauncher />);

        expect(
            screen.getByRole('button', { name: launcherName }),
        ).toHaveFocus();
    });
});
