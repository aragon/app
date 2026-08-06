import {
    AvatarIcon,
    Button,
    Heading,
    Icon,
    IconType,
} from '@aragon/gov-ui-kit';
import { useAuiState } from '@assistant-ui/react';
import { chatCopy, supportEmail, supportEmailHref } from '../../copy';
import { TooltipIconButton } from '../tooltipIconButton';

export interface IChatHeaderProps {
    /**
     * Called when the close button is pressed.
     */
    onClose: () => void;
    /**
     * Starts a fresh request: new session, clean transcript, attachments and draft.
     */
    onNewChat: () => void;
}

export const ChatHeader: React.FC<IChatHeaderProps> = (props) => {
    const { onClose, onNewChat } = props;

    const isEmpty = useAuiState((state) => state.thread.messages.length === 0);

    return (
        <div className="relative flex flex-none items-center gap-2.5 bg-gradient-to-b from-neutral-50 to-transparent py-3 pr-13 pl-5">
            <AvatarIcon icon={IconType.FEEDBACK} size="md" variant="primary" />
            <Heading as="h2" size="h4">
                {chatCopy.header.title}
            </Heading>
            <div className="ml-auto flex items-center gap-1">
                {/* Always-visible escape hatch: users who prefer not to chat can mail the support
                    team directly, in every state, not only on failures. The tooltip carries the
                    full address. */}
                <TooltipIconButton
                    href={supportEmailHref}
                    tooltip={supportEmail}
                >
                    <Icon icon={IconType.SOCIAL_EMAIL} size="sm" />
                </TooltipIconButton>
                {/* One conversation can file several tickets, so a fresh start is always offered —
                    it rotates the session and clears the transcript. Hidden on an already-empty
                    chat where it would do nothing. */}
                {!isEmpty && (
                    <TooltipIconButton
                        onClick={onNewChat}
                        tooltip={chatCopy.header.startNewChat}
                    >
                        <Icon icon={IconType.PEN} size="sm" />
                    </TooltipIconButton>
                )}
            </div>
            <Button
                aria-label={chatCopy.header.close}
                className="!absolute top-3 right-3"
                iconLeft={IconType.CLOSE}
                onClick={onClose}
                size="sm"
                variant="tertiary"
            />
        </div>
    );
};
