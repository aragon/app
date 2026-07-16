import { useChat } from '@ai-sdk/react';
import type { IAppContext } from '@aragon/assistant-contracts';
import { useCallback, useMemo, useRef } from 'react';
import type { IChatMonitoring } from '../monitoring';
import type { AssistantUIMessage, ChatStatus } from './chatTransport.api';
import { createChatTransport } from './createChatTransport';

export interface IUseAssistantChatParams {
    /**
     * Base URL of the assistant service.
     */
    assistantUrl: string;
    /**
     * Identifier of the current chat session; a new identifier starts a fresh chat.
     */
    sessionId: string;
    /**
     * App context sent alongside every request.
     */
    appContext: IAppContext;
    /**
     * Monitoring implementation used to report transport errors.
     */
    monitoring: IChatMonitoring;
}

export interface IUseAssistantChatResult {
    /**
     * Raw transcript, used for stateless issue creation.
     */
    messages: AssistantUIMessage[];
    /**
     * Messages for rendering: only the ones carrying text content (data-part-only chunks are
     * dropped).
     */
    visibleMessages: AssistantUIMessage[];
    /**
     * Status of the current chat request.
     */
    status: ChatStatus;
    /**
     * Error of the last chat request, if any.
     */
    error?: Error;
    /**
     * Sends a user text message to the assistant.
     */
    sendMessage: (text: string) => void;
    /**
     * Aborts the streaming response of the current chat request.
     */
    stop: () => void;
}

/**
 * The widget's single seam to the AI SDK: transport wiring, error reporting and data-part
 * extraction all live behind this hook.
 */
export const useAssistantChat = (
    params: IUseAssistantChatParams,
): IUseAssistantChatResult => {
    const { assistantUrl, sessionId, appContext, monitoring } = params;

    // The transport reads session and context through refs so that a stale closure can never
    // send an outdated session identifier after a rotation.
    const sessionIdRef = useRef(sessionId);
    sessionIdRef.current = sessionId;
    const appContextRef = useRef(appContext);
    appContextRef.current = appContext;

    const transport = useMemo(
        () =>
            createChatTransport({
                assistantUrl,
                getSessionId: () => sessionIdRef.current,
                getAppContext: () => appContextRef.current,
            }),
        [assistantUrl],
    );

    const monitoringRef = useRef(monitoring);
    monitoringRef.current = monitoring;

    const handleError = useCallback(
        (error: Error) =>
            monitoringRef.current.logError(error, {
                context: { step: 'assistantChat.transport' },
            }),
        [],
    );

    const chat = useChat<AssistantUIMessage>({
        id: sessionId,
        transport,
        onError: handleError,
    });

    const visibleMessages = useMemo(
        () =>
            chat.messages.filter((message) =>
                message.parts.some(
                    (part) => part.type === 'text' && part.text.length > 0,
                ),
            ),
        [chat.messages],
    );

    const sendMessage = useCallback(
        (text: string) => void chat.sendMessage({ text }),
        [chat.sendMessage],
    );

    const stop = useCallback(() => void chat.stop(), [chat.stop]);

    return {
        messages: chat.messages,
        visibleMessages,
        status: chat.status,
        error: chat.error,
        sendMessage,
        stop,
    };
};
