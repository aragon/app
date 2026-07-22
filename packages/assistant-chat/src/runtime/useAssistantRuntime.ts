import { useChat } from '@ai-sdk/react';
import type { IAppContext } from '@aragon/assistant-contracts';
import { useAISDKRuntime } from '@assistant-ui/react-ai-sdk';
import { lastAssistantMessageIsCompleteWithApprovalResponses } from 'ai';
import { useCallback, useMemo, useRef } from 'react';
import { createAttachmentAdapter } from '../files';
import type { IChatMonitoring } from '../monitoring';
import type { AssistantUIMessage } from '../transport';
import { createChatTransport } from '../transport';

export interface IUseAssistantRuntimeParams {
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

/**
 * The widget's single seam to the AI SDK and assistant-ui. Wraps our own chat transport in an
 * assistant-ui runtime; `sendAutomaticallyWhen` resumes the stream once the user approves a tool
 * call (the createLinearTicket approval), so ticket creation is a one-click continuation.
 */
export const useAssistantRuntime = (
    params: IUseAssistantRuntimeParams,
): ReturnType<typeof useAISDKRuntime> => {
    const { assistantUrl, sessionId, appContext, monitoring } = params;

    // The transport reads session and context through refs so a stale closure can never send an
    // outdated session identifier after a rotation.
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

    // The adapter reads the session through the same ref, so uploads always target the session
    // that is current at upload time.
    const attachments = useMemo(
        () =>
            createAttachmentAdapter({
                assistantUrl,
                getSessionId: () => sessionIdRef.current,
                logError: (error, params) =>
                    monitoringRef.current.logError(error, params),
            }),
        [assistantUrl],
    );

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
        // Once the user approves the ticket draft, the completed approval response auto-resumes the
        // stream so the tool executes without another user action.
        sendAutomaticallyWhen:
            lastAssistantMessageIsCompleteWithApprovalResponses,
        onError: handleError,
    });

    // Keeping pending tool calls intact on send preserves the approval flow for drafts the user
    // types past: the history then carries the `approval-requested` part and the server resolves
    // it as superseded (a denial), instead of the default client-side rewrite into a tool error —
    // which rendered as a scary "draft did not come through" card and read as a failure to the
    // model.
    return useAISDKRuntime(chat, {
        adapters: { attachments },
        cancelPendingToolCallsOnSend: false,
    });
};
