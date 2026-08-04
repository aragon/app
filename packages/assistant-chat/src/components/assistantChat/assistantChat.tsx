import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useCallback } from 'react';
import { noopMonitoring } from '../../monitoring';
import { useAssistantRuntime } from '../../runtime';
import { useChatSession } from '../../session';
import { ChatHeader } from '../chatHeader';
import { Thread } from '../thread';
import type { IAssistantChatProps } from './assistantChat.api';

// The widget fills whatever container the host renders it in — panel geometry, visibility and
// animations are owned by the host layout, so the same chat content works in a side panel, a
// fullscreen overlay or any future shell. Chat behaviour (streaming, composer, attachments, tool
// cards, approval) lives in the assistant-ui runtime and the ported registry components; this
// component only wires our session, monitoring and header chrome around them.
export const AssistantChat: React.FC<IAssistantChatProps> = (props) => {
    const {
        isOpen,
        onClose,
        assistantUrl,
        appContext,
        monitoring = noopMonitoring,
    } = props;

    const { sessionId, rotate } = useChatSession();

    const runtime = useAssistantRuntime({
        assistantUrl,
        sessionId,
        appContext,
        monitoring,
    });

    const startNewChat = useCallback(() => {
        // The composer lives in the assistant-ui runtime and survives a session rotation, so a
        // fresh chat clears its draft and attachments explicitly (removal also frees the server
        // slots of the old session).
        runtime.thread.composer.setText('');
        void runtime.thread.composer.clearAttachments();
        // The runtime starts a fresh thread when the session identifier changes.
        rotate();
    }, [runtime, rotate]);

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            <div className="flex h-full min-h-0 flex-col">
                <ChatHeader onClose={onClose} onNewChat={startNewChat} />
                <Thread isOpen={isOpen} />
            </div>
        </AssistantRuntimeProvider>
    );
};
