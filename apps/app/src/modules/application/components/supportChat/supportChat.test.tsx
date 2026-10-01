import type { IChatFeatures } from '@aragon/assistant-contracts';
import { render, screen } from '@testing-library/react';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import { SupportChat } from './supportChat';
import * as supportChatContext from './supportChatContext';

jest.mock('./assistantChatLazy', () => ({
    AssistantChatLazy: (props: {
        isOpen: boolean;
        features: IChatFeatures;
    }) => (
        <div data-open={props.isOpen} data-testid="assistant-chat-mock">
            {props.features.docsSearch
                ? 'documentation answers on'
                : 'documentation answers off'}
        </div>
    ),
}));

jest.mock('./useSupportAppContext', () => ({
    useSupportAppContext: () => ({ route: '/', appVersion: '1.0.0' }),
}));

// The open / close state lives in the support chat context; this component only manages the
// mount lifecycle of the widget and hands it what the feature flags let the chat do.
describe('<SupportChat /> component', () => {
    const useSupportChatContextSpy = jest.spyOn(
        supportChatContext,
        'useSupportChatContext',
    );

    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    const setContextOpen = (isOpen: boolean) => {
        useSupportChatContextSpy.mockReturnValue({
            isOpen,
            open: jest.fn(),
            close: jest.fn(),
            toggle: jest.fn(),
        });
    };

    const setDocsEnabled = (enabled: boolean) => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: (key) => key === 'supportChatDocs' && enabled,
        } as ReturnType<typeof featureFlagsProvider.useFeatureFlags>);
    };

    beforeEach(() => {
        setDocsEnabled(true);
    });

    afterEach(() => {
        useSupportChatContextSpy.mockReset();
        useFeatureFlagsSpy.mockReset();
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

    it('lets the widget answer from the documentation only when the supportChatDocs flag is on', () => {
        setContextOpen(true);
        render(<SupportChat />);
        expect(
            screen.getByText('documentation answers on'),
        ).toBeInTheDocument();

        setDocsEnabled(false);
        render(<SupportChat />);
        expect(
            screen.getByText('documentation answers off'),
        ).toBeInTheDocument();
    });
});
