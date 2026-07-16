import { useEffect, useRef } from 'react';
import { useAssistantChatContext } from '../../controller';
import {
    type AssistantUIMessage,
    getAssistantErrorText,
    parseAssistantError,
} from '../../transport';
import { ChatErrorPanel } from '../chatErrorPanel';
import { ChatRequestHistory } from '../chatRequestHistory';
import { ChatSuccessPanel } from '../chatSuccessPanel';
import { ChatMessageItem } from './chatMessageItem';
import { ChatTypingIndicator } from './chatTypingIndicator';

const greetingMessage: AssistantUIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [
        {
            type: 'text',
            text: "Hi! Tell us what's going on and we'll get it to the right team.",
        },
    ],
};

// A user who scrolled up further than this is reading history; auto-follow pauses until they
// scroll back near the bottom.
const followThreshold = 100;

export const ChatMessageList: React.FC = () => {
    const {
        sessionId,
        messages,
        chatStatus,
        chatError,
        flowState,
        supportPortalUrl,
    } = useAssistantChatContext();

    const isTyping = chatStatus === 'submitted';

    const chatErrorText = getAssistantErrorText(
        parseAssistantError(chatError)?.code,
        'Something went wrong. Please try sending your message again.',
    );

    const endRef = useRef<HTMLDivElement>(null);

    // Whether the view is pinned to the bottom; recorded on scroll (before new content changes
    // the geometry) so a user reading history is never yanked down by a streamed chunk.
    const isFollowingRef = useRef(true);

    // A fresh session starts pinned: clearing the transcript from scrollTop 0 fires no scroll
    // event, so without the reset the ref could stay false into the new chat.
    // biome-ignore lint/correctness/useExhaustiveDependencies: sessionId triggers the reset, it is not read.
    useEffect(() => {
        isFollowingRef.current = true;
    }, [sessionId]);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
        isFollowingRef.current =
            scrollHeight - scrollTop - clientHeight < followThreshold;
    };

    // Follow the latest content: new messages, streaming chunks and flow panels.
    // biome-ignore lint/correctness/useExhaustiveDependencies: dependencies trigger the scroll, they are not read.
    useEffect(() => {
        if (isFollowingRef.current) {
            endRef.current?.scrollIntoView({ block: 'end' });
        }
    }, [messages, isTyping, flowState]);

    return (
        <div
            aria-live="polite"
            className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-5 pt-2 pb-4"
            onScroll={handleScroll}
        >
            <ChatMessageItem message={greetingMessage} />
            <ChatRequestHistory />
            {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
            ))}
            {isTyping && <ChatTypingIndicator />}
            {chatStatus === 'error' && chatError != null && (
                <div className="flex flex-col gap-1 self-start">
                    <p className="text-critical-800 text-sm leading-normal">
                        {chatErrorText}
                    </p>
                    {supportPortalUrl != null && (
                        <a
                            className="text-primary-400 text-sm leading-normal underline"
                            href={supportPortalUrl}
                            rel="noreferrer"
                            target="_blank"
                        >
                            …or file your request via the support portal →
                        </a>
                    )}
                </div>
            )}
            <ChatErrorPanel />
            <ChatSuccessPanel />
            <div ref={endRef} />
        </div>
    );
};
