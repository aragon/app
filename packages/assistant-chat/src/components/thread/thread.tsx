import { Icon, IconType, Spinner } from '@aragon/gov-ui-kit';
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
import { getAssistantErrorText, parseAssistantError } from '../../transport';
import {
    ComposerAddAttachment,
    ComposerAttachments,
    UserMessageAttachments,
} from '../attachment';
import { ChatRequestHistory } from '../chatRequestHistory';
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
}

// Startup exposes a loading placeholder thread; treat it as a new chat so the welcome screen
// shows. Loads after startup keep the conversation layout.
const isNewChatView = (state: AssistantState) =>
    state.thread.messages.length === 0 &&
    (!state.thread.isLoading || state.threads.isLoading);

export const Thread: React.FC<IThreadProps> = (props) => {
    const { isOpen } = props;

    return (
        <ThreadPrimitive.Root
            className="flex h-full min-h-0 flex-1 flex-col bg-neutral-0"
            style={
                {
                    '--thread-max-width': '100%',
                    '--composer-bg':
                        'color-mix(in oklab, var(--color-neutral-50) 30%, var(--color-neutral-0))',
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

                    <ThreadPrimitive.ViewportFooter className="sticky bottom-0 flex flex-col gap-4 overflow-visible rounded-t-(--composer-radius) bg-neutral-0 pb-4 md:pb-6">
                        <AuiIf
                            condition={(state) =>
                                isNewChatView(state) && state.composer.isEmpty
                            }
                        >
                            <ThreadSuggestions />
                        </AuiIf>
                        <Composer isOpen={isOpen} />
                    </ThreadPrimitive.ViewportFooter>
                </div>
            </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
    );
};

const ThreadMessage: React.FC = () => {
    const role = useAuiState((state) => state.message.role);

    return role === 'user' ? <UserMessage /> : <AssistantMessage />;
};

// Fills the space between header and composer on a fresh chat: the greeting sits centered in it,
// the request history (when any) right below.
const ThreadWelcome: React.FC = () => (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-center">
        <h2 className="max-w-md font-semibold text-2xl text-neutral-800">
            {chatCopy.welcome.greeting}
        </h2>
        <ChatRequestHistory />
    </div>
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
                    className="focus-ring-primary whitespace-nowrap rounded-full border border-neutral-100 px-3.5 py-1.5 text-neutral-800 text-sm transition-colors hover:bg-neutral-50"
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
                <div className="flex w-full flex-col gap-2 rounded-(--composer-radius) border border-neutral-100 bg-(--composer-bg) p-(--composer-padding) shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] focus-within:border-primary-400 focus-within:shadow-[0_6px_24px_-8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)] data-[dragging=true]:border-primary-400 data-[dragging=true]:border-dashed data-[dragging=true]:bg-primary-50">
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
                        placeholder={chatCopy.composer.placeholder}
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
                        by_name: { createLinearTicket: CreateTicketCard },
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
            <div className="wrap-break-word whitespace-pre-wrap rounded-xl bg-neutral-100 px-4 py-2 text-neutral-800 text-sm empty:hidden">
                <MessagePrimitive.Parts />
            </div>
        </div>
    </MessagePrimitive.Root>
);
