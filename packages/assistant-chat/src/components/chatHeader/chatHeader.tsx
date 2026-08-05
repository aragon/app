import {
    createTicketToolName,
    type ICreateTicketToolInput,
    type ICreateTicketToolOutput,
} from '@aragon/assistant-contracts';
import { Heading, Icon, IconType } from '@aragon/gov-ui-kit';
import { type AssistantState, useAuiState } from '@assistant-ui/react';
import { chatCopy } from '../../copy';
import { TooltipIconButton } from '../tooltipIconButton';
import { AragonMark } from './aragonMark';

export interface IChatHeaderProps {
    /**
     * Whether the panel currently shows the past requests instead of the conversation.
     */
    isViewingRequests: boolean;
    /**
     * Returns from the past requests to the conversation.
     */
    onBack: () => void;
    /**
     * Called when the collapse button is pressed.
     */
    onClose: () => void;
    /**
     * Starts a fresh request: new session, clean transcript, attachments and draft.
     */
    onNewChat: () => void;
}

type MessagePart =
    AssistantState['thread']['messages'][number]['parts'][number];

const isTicketPart = (part: MessagePart) =>
    part.type === 'tool-call' && part.toolName === createTicketToolName;

// Names the object the conversation is working on: the title of the draft being assembled, or the
// created ticket once the tool returned. Spent drafts name nothing — the same states the ticket
// card collapses into a quiet line drop the header back to the fresh-conversation subline.
const useTicketContext = (): string | undefined =>
    useAuiState((state) => {
        const { messages } = state.thread;

        // The last ticket of the thread is the one the header speaks about; its message position
        // tells a superseded draft (the user kept typing past it) from a live one.
        const messageIndex = messages.findLastIndex((message) =>
            message.parts.some(isTicketPart),
        );
        const ticket = messages[messageIndex]?.parts.findLast(isTicketPart);

        if (ticket?.type !== 'tool-call') {
            return undefined;
        }

        // Arguments stream in as a partial parse, so the title may not have arrived yet.
        const { title } = ticket.args as Partial<ICreateTicketToolInput>;

        if (title == null) {
            return undefined;
        }

        const result = ticket.result as ICreateTicketToolOutput | undefined;
        const { approval, isError } = ticket;

        if (result != null && isError !== true) {
            return `${result.identifier}: ${title}`;
        }

        // Mirrors the spent states of the card: the user dismissed or cancelled the draft, kept
        // typing past it, or it never came through. A creation that was attempted and failed keeps
        // its title — that card still offers a retry.
        const isDismissed =
            approval?.approved === false || approval?.resolution != null;
        const isSuperseded =
            approval?.approved == null && messageIndex < messages.length - 1;
        const isInterrupted = isError === true && approval?.approved !== true;

        if (isDismissed || isSuperseded || isInterrupted) {
            return undefined;
        }

        return `${chatCopy.header.contextDraftPrefix} ${title}`;
    });

export const ChatHeader: React.FC<IChatHeaderProps> = (props) => {
    const { isViewingRequests, onBack, onClose, onNewChat } = props;

    const isEmpty = useAuiState((state) => state.thread.messages.length === 0);
    const ticketContext = useTicketContext();

    const context = isViewingRequests
        ? chatCopy.requestHistory.heading
        : (ticketContext ?? chatCopy.header.contextNew);

    // The header stands next to the app's navigation bar and carries its exact height (20px of
    // padding around a 50px control row, plus the 1px rule): anything else meets the bar's bottom
    // border in a step at the panel edge.
    return (
        <div className="flex min-h-[91px] flex-none items-center gap-3.5 border-neutral-100 border-b pr-3.5 pl-5">
            {isViewingRequests ? (
                <TooltipIconButton
                    onClick={onBack}
                    tooltip={chatCopy.header.back}
                >
                    <Icon icon={IconType.CHEVRON_LEFT} size="sm" />
                </TooltipIconButton>
            ) : (
                <AragonMark />
            )}
            <div className="flex min-w-0 flex-col">
                <Heading as="h2" size="h4">
                    {chatCopy.header.title}
                </Heading>
                <p className="truncate text-neutral-400 text-xs">{context}</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
                {/* One conversation can file several tickets, so a fresh start is always offered —
                    it rotates the session and clears the transcript. Hidden on an already-empty
                    chat where it would do nothing. */}
                {!(isEmpty || isViewingRequests) && (
                    <TooltipIconButton
                        onClick={onNewChat}
                        tooltip={chatCopy.header.startNewChat}
                    >
                        <Icon icon={IconType.PLUS} size="sm" />
                    </TooltipIconButton>
                )}
                {/* The chevron points at the panel edge the chat tucks away to; the navigation
                    trigger brings it back. */}
                <TooltipIconButton
                    onClick={onClose}
                    tooltip={chatCopy.header.collapse}
                >
                    <Icon icon={IconType.CHEVRON_RIGHT} size="sm" />
                </TooltipIconButton>
            </div>
        </div>
    );
};
