import { render, screen } from '@testing-library/react';
import { SupportChat } from './supportChat';
import * as supportChatContext from './supportChatContext';

jest.mock('./assistantChatLazy', () => ({
    AssistantChatLazy: (props: { isOpen: boolean }) => (
        <div data-open={props.isOpen} data-testid="assistant-chat-mock" />
    ),
}));

jest.mock('./useSupportAppContext', () => ({
    useSupportAppContext: () => ({ route: '/', appVersion: '1.0.0' }),
}));

// The open / close state lives in the support chat context; this component only manages the
// mount lifecycle of the widget.
describe('<SupportChat /> component', () => {
    const useSupportChatContextSpy = jest.spyOn(
        supportChatContext,
        'useSupportChatContext',
    );

    const setContextOpen = (isOpen: boolean) => {
        useSupportChatContextSpy.mockReturnValue({
            isOpen,
            open: jest.fn(),
            close: jest.fn(),
            toggle: jest.fn(),
        });
    };

    afterEach(() => {
        useSupportChatContextSpy.mockReset();
    });

    it('does not mount the widget before the first open', () => {
        setContextOpen(false);
        render(<SupportChat />);
        expect(
            screen.queryByTestId('assistant-chat-mock'),
        ).not.toBeInTheDocument();
    });

    it('mounts and opens the widget on open', () => {
        setContextOpen(true);
        render(<SupportChat />);
        expect(
            screen.getByTestId('assistant-chat-mock').getAttribute('data-open'),
        ).toEqual('true');
    });

    it('keeps the widget mounted after closing so the conversation survives reopening', () => {
        setContextOpen(true);
        const { rerender } = render(<SupportChat />);
        expect(screen.getByTestId('assistant-chat-mock')).toBeInTheDocument();

        setContextOpen(false);
        rerender(<SupportChat />);
        expect(
            screen.getByTestId('assistant-chat-mock').getAttribute('data-open'),
        ).toEqual('false');
    });
});
