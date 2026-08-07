import {
    createTicketToolName,
    type ICreateTicketToolInput,
    type ICreateTicketToolOutput,
} from '@aragon/assistant-contracts';
import { Heading, Icon, IconType } from '@aragon/gov-ui-kit';
import { useAuiState } from '@assistant-ui/react';
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

// Names the object the conversation is working on: the title of the draft being assembled, or the
// created ticket once the tool returned.
const useTicketContext = (): string | undefined =>
    useAuiState((state) => {
        const ticket = state.thread.messages
            .flatMap((message) => message.parts)
            .findLast(
                (part) =>
                    part.type === 'tool-call' &&
                    part.toolName === createTicketToolName,
            );

        if (ticket?.type !== 'tool-call') {
            return undefined;
        }

        // Arguments stream in as a partial parse, so the title may not have arrived yet.
        const { title } = ticket.args as Partial<ICreateTicketToolInput>;

        if (title == null) {
            return undefined;
        }

        const result = ticket.result as ICreateTicketToolOutput | undefined;

        return result != null && ticket.isError !== true
            ? `${result.identifier}: ${title}`
            : `${chatCopy.header.contextDraftPrefix} ${title}`;
    });

export const ChatHeader: React.FC<IChatHeaderProps> = (props) => {
    const { isViewingRequests, onBack, onClose, onNewChat } = props;

    const isEmpty = useAuiState((state) => state.thread.messages.length === 0);
    const ticketContext = useTicketContext();

    const context = isViewingRequests
        ? chatCopy.requestHistory.heading
        : (ticketContext ?? chatCopy.header.contextNew);

    return (
        <div className="flex min-h-22 flex-none items-center gap-3.5 border-neutral-100 border-b pr-3.5 pl-5">
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
