import { render, screen } from '@testing-library/react';
import { SupportChat } from './supportChat';
import type { ISupportChatProps } from './supportChat.api';

jest.mock('./assistantChatLazy', () => ({
    AssistantChatLazy: (props: { isOpen: boolean }) => (
        <div data-open={props.isOpen} data-testid="assistant-chat-mock" />
    ),
}));

jest.mock('./useSupportAppContext', () => ({
    useSupportAppContext: () => ({ route: '/', appVersion: '1.0.0' }),
}));

// Availability is decided before opening (useAssistantHealth in the footer), so this component
// only manages the mount lifecycle of the widget.
describe('<SupportChat /> component', () => {
    const createTestComponent = (props?: Partial<ISupportChatProps>) => {
        const completeProps: ISupportChatProps = {
            isOpen: false,
            onClose: jest.fn(),
            ...props,
        };

        return <SupportChat {...completeProps} />;
    };

    it('does not mount the widget before the first open', () => {
        render(createTestComponent({ isOpen: false }));
        expect(
            screen.queryByTestId('assistant-chat-mock'),
        ).not.toBeInTheDocument();
    });

    it('mounts and opens the widget on open', () => {
        render(createTestComponent({ isOpen: true }));
        expect(
            screen.getByTestId('assistant-chat-mock').getAttribute('data-open'),
        ).toEqual('true');
    });

    it('keeps the widget mounted after closing so the conversation survives reopening', () => {
        const { rerender } = render(createTestComponent({ isOpen: true }));
        expect(screen.getByTestId('assistant-chat-mock')).toBeInTheDocument();

        rerender(createTestComponent({ isOpen: false }));
        expect(
            screen.getByTestId('assistant-chat-mock').getAttribute('data-open'),
        ).toEqual('false');
    });
});
