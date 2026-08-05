import { createTicketToolName } from '@aragon/assistant-contracts';
import { Heading, Icon, IconType, Spinner } from '@aragon/gov-ui-kit';
import {
    ActionBarPrimitive,
    type AssistantState,
    AuiIf,
    ComposerPrimitive,
    type EmptyMessagePartComponent,
    ErrorPrimitive,
    MessagePrimitive,
    ThreadPrimitive,
    useAuiState,
} from '@assistant-ui/react';
import { useEffect, useRef } from 'react';
import { chatCopy, supportEmailHref } from '../../copy';
import { useRequestHistory } from '../../requests';
import { getAssistantErrorText, parseAssistantError } from '../../transport';
import {
    ComposerAddAttachment,
    ComposerAttachments,
    UserMessageAttachments,
} from '../attachment';
import { CreateTicketCard } from '../createTicketCard';
import { MarkdownText } from '../markdownText';
import { TooltipIconButton } from '../tooltipIconButton';

// Port of the assistant-ui registry thread: sticky composer in the viewport footer, centered
// welcome with suggestion chips, recolored to the Aragon theme tokens and with gov-ui-kit icons.
// Deviations: classic bottom-anchored flow (turnAnchor="bottom" — messages stack from the bottom
// and the viewport follows, no scroll jumps), no scroll-to-bottom button. Cut against the
// registry: action bars (edit/export/reload), branch picker, edit composer, dictation, reasoning
// and tool grouping — the support chat offers none of those interactions.

export interface IThreadProps {
    /**
     * Whether the chat is currently visible; the composer grabs focus when it becomes true.
     */
    isOpen: boolean;
    /**
     * Opens the requests filed from this device.
     */
    onViewRequests: () => void;
}

// Startup exposes a loading placeholder thread; treat it as a new chat so the welcome screen
// shows. Loads after startup keep the conversation layout.
const isNewChatView = (state: AssistantState) =>
    state.thread.messages.length === 0 &&
    (!state.thread.isLoading || state.threads.isLoading);

export const Thread: React.FC<IThreadProps> = (props) => {
    const { isOpen, onViewRequests } = props;

    return (
        <ThreadPrimitive.Root
            className="flex h-full min-h-0 flex-1 flex-col bg-neutral-0"
            style={
                {
                    '--thread-max-width': '100%',
                    '--composer-radius': '1rem',
                    '--composer-padding': '8px',
                } as React.CSSProperties
            }
        >
            {/* The scrollbar is hidden (wheel/touch scrolling stays): the thread sits right next
                to the page scrollbar and two adjacent bars read as a glitch. */}
            <ThreadPrimitive.Viewport
                className="relative flex flex-1 flex-col overflow-x-auto overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                turnAnchor="bottom"
            >
                {/* Stable skeleton in every state: the composer is always pinned to the bottom;
                    the welcome block fills the space above it on a fresh chat, messages take
                    over once the conversation starts. Nothing repositions between the two. */}
                <div className="mx-auto flex w-full max-w-(--thread-max-width) flex-1 flex-col px-4 pt-4">
                    <AuiIf condition={isNewChatView}>
                        <ThreadWelcome />
                    </AuiIf>

                    {/* mt-auto pins a short conversation to the bottom, so messages stack from
                        the composer upwards. */}
                    <div className="mt-auto mb-8 flex flex-col gap-y-6 empty:hidden">
                        <ThreadPrimitive.Messages>
                            {() => <ThreadMessage />}
                        </ThreadPrimitive.Messages>
                    </div>

                    <ThreadPrimitive.ViewportFooter className="sticky bottom-0 flex flex-col gap-3 overflow-visible rounded-t-(--composer-radius) bg-neutral-0 pb-4 md:pb-6">
                        <AuiIf
                            condition={(state) =>
                                isNewChatView(state) && state.composer.isEmpty
                            }
                        >
                            <ThreadSuggestions />
                        </AuiIf>
                        <Composer isOpen={isOpen} />
                        {/* One quiet line under the composer: the way back to a filed request on a
                            fresh chat, the way to a human once the conversation is under way. */}
                        <AuiIf condition={isNewChatView}>
                            <PastRequestsLink onViewRequests={onViewRequests} />
                        </AuiIf>
                        <AuiIf condition={(state) => !isNewChatView(state)}>
                            <EmailEscalation />
                        </AuiIf>
                    </ThreadPrimitive.ViewportFooter>
                </div>
            </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
    );
};

// Messages sent within the same sitting need no divider; a longer pause means the user comes back
// to the conversation, and then the transcript says when it was left.
const conversationGapMs = 30 * 60 * 1000;

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
});

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });

const formatDividerLabel = (date: Date): string => {
    const day =
        date.toDateString() === new Date().toDateString()
            ? chatCopy.thread.today
            : weekdayFormatter.format(date);

    return `${day} ${timeFormatter.format(date)}`;
};

const selectDividerLabel = (state: AssistantState): string | undefined => {
    const { createdAt, index } = state.message;
    const previous = state.thread.messages[index - 1];

    if (
        previous != null &&
        createdAt.getTime() - previous.createdAt.getTime() < conversationGapMs
    ) {
        return undefined;
    }

    return formatDividerLabel(createdAt);
};

interface IThreadTimeDividerProps {
    /**
     * Time the messages below the divider start at.
     */
    label: string;
}

const ThreadTimeDivider: React.FC<IThreadTimeDividerProps> = (props) => {
    const { label } = props;

    return (
        <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-neutral-100" />
            <p className="flex-none text-neutral-400 text-xs">{label}</p>
            <span className="h-px flex-1 bg-neutral-100" />
        </div>
    );
};

const ThreadMessage: React.FC = () => {
    const role = useAuiState((state) => state.message.role);
    const dividerLabel = useAuiState(selectDividerLabel);

    return (
        <>
            {dividerLabel != null && <ThreadTimeDivider label={dividerLabel} />}
            {role === 'user' ? <UserMessage /> : <AssistantMessage />}
        </>
    );
};

// Fills the space between header and composer on a fresh chat.
const ThreadWelcome: React.FC = () => (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-6 text-center">
        <Heading as="h2" className="text-balance" size="h3">
            {chatCopy.welcome.greeting}
        </Heading>
    </div>
);

interface IPastRequestsLinkProps {
    /**
     * Opens the requests filed from this device.
     */
    onViewRequests: () => void;
}

const PastRequestsLink: React.FC<IPastRequestsLinkProps> = (props) => {
    const { onViewRequests } = props;

    const requestHistory = useRequestHistory();

    if (requestHistory.length === 0) {
        return null;
    }

    return (
        <button
            className="focus-ring-primary mx-auto cursor-pointer rounded-sm text-neutral-500 text-xs underline underline-offset-2"
            onClick={onViewRequests}
            type="button"
        >
            {`${chatCopy.requestHistory.heading} (${requestHistory.length})`}
        </button>
    );
};

const EmailEscalation: React.FC = () => (
    <p className="text-center text-neutral-400 text-xs">
        {`${chatCopy.composer.escalationPrompt} `}
        <a
            className="text-primary-400 underline underline-offset-2"
            href={supportEmailHref}
        >
            {chatCopy.composer.escalationLink}
        </a>
    </p>
);

const ThreadSuggestions: React.FC = () => (
    <div className="flex w-full flex-wrap items-center justify-center gap-2 px-4">
        {chatCopy.welcome.suggestions.map((suggestion) => (
            <ThreadPrimitive.Suggestion
                asChild={true}
                key={suggestion.label}
                prompt={suggestion.message}
                send={true}
            >
                <button
                    className="focus-ring-primary cursor-pointer whitespace-nowrap rounded-full border border-neutral-100 px-3.5 py-1.5 text-neutral-800 text-sm transition-colors hover:bg-neutral-50"
                    type="button"
                >
                    {suggestion.label}
                </button>
            </ThreadPrimitive.Suggestion>
        ))}
    </div>
);

interface IComposerProps {
    /**
     * Whether the chat is currently visible; the input grabs focus when it becomes true.
     */
    isOpen: boolean;
}

const Composer: React.FC<IComposerProps> = (props) => {
    const { isOpen } = props;

    const inputRef = useRef<HTMLTextAreaElement>(null);

    // A fresh chat asks for the issue, an ongoing one for the next reply.
    const placeholder = useAuiState((state) =>
        isNewChatView(state)
            ? chatCopy.composer.placeholder
            : chatCopy.composer.placeholderReply,
    );

    // The host panel is non-modal (no focus trap), so the composer takes focus itself whenever
    // the chat becomes visible — including the very first lazy mount.
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    return (
        <ComposerPrimitive.Root className="relative flex w-full flex-col">
            <ComposerPrimitive.AttachmentDropzone asChild={true}>
                <div className="flex w-full flex-col gap-2 rounded-(--composer-radius) border border-neutral-200 bg-neutral-0 p-(--composer-padding) shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] focus-within:border-primary-400 focus-within:shadow-[0_6px_24px_-8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)] data-[dragging=true]:border-primary-400 data-[dragging=true]:border-dashed data-[dragging=true]:bg-primary-50">
                    <ComposerAttachments />
                    <AuiIf
                        condition={(state) =>
                            state.composer.attachments.length > 0
                        }
                    >
                        <p className="px-2.5 text-neutral-300 text-xs leading-normal">
                            {chatCopy.composer.attachmentsShared}
                        </p>
                    </AuiIf>
                    <ComposerPrimitive.Input
                        aria-label={chatCopy.composer.inputLabel}
                        className="max-h-32 min-h-10 w-full resize-none bg-transparent px-2.5 py-1 text-neutral-800 text-sm caret-primary-400 outline-none placeholder:text-neutral-300"
                        enterKeyHint="send"
                        placeholder={placeholder}
                        ref={inputRef}
                        rows={1}
                    />
                    <ComposerAction />
                </div>
            </ComposerPrimitive.AttachmentDropzone>
        </ComposerPrimitive.Root>
    );
};

// The send arrow, drawn locally: gov-ui-kit has no arrow-up icon and its CHEVRON_UP is too thin
// for the solid send button. Geometry and stroke match the registry's lucide ArrowUpIcon.
const SendArrowIcon: React.FC = () => (
    <svg
        aria-hidden="true"
        className="size-4.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
    >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
    </svg>
);

const ComposerAction: React.FC = () => {
    return (
        <div className="relative flex items-center justify-between">
            <ComposerAddAttachment />
            <div className="flex items-center gap-1.5">
                <AuiIf condition={(state) => !state.thread.isRunning}>
                    <ComposerPrimitive.Send asChild={true}>
                        <TooltipIconButton
                            side="bottom"
                            tooltip={chatCopy.composer.send}
                            variant="primary"
                        >
                            <SendArrowIcon />
                        </TooltipIconButton>
                    </ComposerPrimitive.Send>
                </AuiIf>
                <AuiIf condition={(state) => state.thread.isRunning}>
                    <ComposerPrimitive.Cancel asChild={true}>
                        <TooltipIconButton
                            side="bottom"
                            tooltip={chatCopy.composer.stop}
                            variant="primary"
                        >
                            {/* The stop square, drawn as a styled span (gov-ui-kit has no square icon). */}
                            <span
                                aria-hidden="true"
                                className="size-2.5 rounded-[2px] bg-current"
                            />
                        </TooltipIconButton>
                    </ComposerPrimitive.Cancel>
                </AuiIf>
            </div>
        </div>
    );
};

const MessageErrorText: React.FC = () => {
    // The assistant-ui message state carries the raw transport error message; the service encodes
    // its error shape into it, which maps to the human wording of the known failure modes.
    const error = useAuiState((state) =>
        state.message.status?.type === 'incomplete' &&
        state.message.status.reason === 'error'
            ? state.message.status.error
            : undefined,
    );

    const text = getAssistantErrorText(
        parseAssistantError(error)?.code,
        chatCopy.thread.chatErrorFallback,
    );

    return (
        <>
            <p>{text}</p>
            <a className="underline" href={supportEmailHref}>
                {chatCopy.thread.emailEscapeHatch}
            </a>
        </>
    );
};

const MessageError: React.FC = () => (
    <MessagePrimitive.Error>
        <ErrorPrimitive.Root className="mt-2 flex flex-col gap-1 rounded-xl border border-critical-300 bg-critical-100/40 p-3 text-critical-800 text-sm leading-normal">
            <MessageErrorText />
        </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
);

// Waiting for the first token: a plain spinner, the familiar chat loader.
const AssistantTyping: EmptyMessagePartComponent = ({ status }) => {
    if (status.type !== 'running') {
        return null;
    }

    return (
        <div
            aria-label={chatCopy.thread.typing}
            className="flex items-center py-1"
            role="status"
        >
            <Spinner size="md" variant="neutral" />
        </div>
    );
};

// The registry assistant action bar reduced to its Copy action (with the check feedback) — the
// reload / more / export actions stay cut along with the branch picker. Always visible (no
// hover autohide): appearing on hover makes the layout feel jumpy.
const AssistantActionBar: React.FC = () => (
    <ActionBarPrimitive.Root
        className="-ms-1 flex gap-1 text-neutral-500"
        hideWhenRunning={true}
    >
        <ActionBarPrimitive.Copy asChild={true}>
            <TooltipIconButton tooltip={chatCopy.thread.copyMessage}>
                <AuiIf condition={(state) => state.message.isCopied}>
                    <Icon icon={IconType.CHECKMARK} size="sm" />
                </AuiIf>
                <AuiIf condition={(state) => !state.message.isCopied}>
                    <Icon icon={IconType.COPY} size="sm" />
                </AuiIf>
            </TooltipIconButton>
        </ActionBarPrimitive.Copy>
    </ActionBarPrimitive.Root>
);

const AssistantMessage: React.FC = () => (
    <MessagePrimitive.Root
        className="group relative [contain-intrinsic-size:auto_200px] [content-visibility:auto]"
        data-role="assistant"
    >
        <div className="wrap-break-word px-2 text-neutral-800 text-sm leading-relaxed">
            {/* Tools without a registered component (flagOffTopic, the future searchDocs)
                deliberately render nothing — the model narrates around them. */}
            <MessagePrimitive.Parts
                components={{
                    Text: MarkdownText,
                    Empty: AssistantTyping,
                    tools: {
                        by_name: { [createTicketToolName]: CreateTicketCard },
                    },
                }}
            />
            <MessageError />
        </div>

        {/* The slot always occupies its height so messages never shift; the bar itself fades in
            on hover (or keyboard focus) only. */}
        <div className="ms-2 flex items-center pt-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <AssistantActionBar />
        </div>
    </MessagePrimitive.Root>
);

const UserMessage: React.FC = () => (
    <MessagePrimitive.Root
        className="grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 [contain-intrinsic-size:auto_200px] [content-visibility:auto] [&:where(>*)]:col-start-2"
        data-role="user"
    >
        <UserMessageAttachments />

        <div className="relative col-start-2 min-w-0">
            <div className="wrap-break-word whitespace-pre-wrap rounded-xl rounded-br-sm bg-neutral-100 px-4 py-2 text-neutral-800 text-sm empty:hidden">
                <MessagePrimitive.Parts />
            </div>
        </div>
    </MessagePrimitive.Root>
);
