import type {
    IAppContext,
    ICreateIssueRequest,
    ICreateIssueResponse,
} from '@aragon/assistant-contracts';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    type IChatAttachment,
    type IFileAlert,
    useFileAttachments,
} from '../files';
import {
    type ITicketError,
    type ITicketPreview,
    type TicketStatus,
    useTicket,
} from '../issues';
import type { IChatMonitoring } from '../monitoring';
import {
    appendRequestToHistory,
    getRequestHistory,
    type IRequestHistoryEntry,
} from '../requests';
import { useChatSession } from '../session';
import {
    type AssistantUIMessage,
    type ChatStatus,
    useAssistantChat,
} from '../transport';
import type { ChatFlowState } from './chatFlowState.api';

export interface IUseAssistantChatControllerParams {
    /**
     * Base URL of the assistant service.
     */
    assistantUrl: string;
    /**
     * App context sent alongside every request.
     */
    appContext: IAppContext;
    /**
     * Fallback support-portal URL offered when the chat hard-fails.
     */
    supportPortalUrl?: string;
    /**
     * Monitoring implementation injected by the host app.
     */
    monitoring: IChatMonitoring;
}

export interface IAssistantChatController {
    /**
     * Identifier of the current chat session.
     */
    sessionId: string;
    /**
     * App context sent alongside every request.
     */
    appContext: IAppContext;
    /**
     * Fallback support-portal URL offered when the chat hard-fails; undefined when not configured.
     */
    supportPortalUrl?: string;
    /**
     * Messages of the transcript, ready for rendering.
     */
    messages: AssistantUIMessage[];
    /**
     * Status of the current chat request.
     */
    chatStatus: ChatStatus;
    /**
     * Error of the last chat request, if any.
     */
    chatError?: Error;
    /**
     * Sends a user message; a message sent after a preview makes that preview stale and resets
     * it. Ignored once the session's issue has been created (one ticket = one chat — a new
     * request starts through startNewChat).
     */
    sendMessage: (text: string) => void;
    /**
     * Aborts the streaming response of the current chat request.
     */
    stop: () => void;
    /**
     * Derived state of the intake flow.
     */
    flowState: ChatFlowState;
    /**
     * Prepares the ticket preview from the current transcript.
     */
    prepareTicket: () => void;
    /**
     * The reviewed ticket preview, set while flowState is previewReady (and kept through
     * creation).
     */
    ticketPreview?: ITicketPreview;
    /**
     * Error of the last preview attempt; preparing again retries.
     */
    previewError?: ITicketError;
    /**
     * Creates the issue the preview showed; also used to retry after a failure. Ignored while
     * attachments are still uploading or being removed.
     */
    createIssue: () => void;
    /**
     * The created issue, set on success.
     */
    issue?: ICreateIssueResponse;
    /**
     * Error of the last issue creation attempt.
     */
    issueError?: ITicketError;
    /**
     * Resets the widget for a fresh request: new session, clean transcript and attachments.
     */
    startNewChat: () => void;
    /**
     * Previously created requests of this device, newest first.
     */
    requestHistory: IRequestHistoryEntry[];
    /**
     * Attachments of the current session.
     */
    attachments: IChatAttachment[];
    /**
     * Validates and uploads the given files.
     */
    addFiles: (files: File[]) => void;
    /**
     * Removes an attachment, aborting its upload when still in flight.
     */
    removeFile: (id: string) => void;
    /**
     * Client-side file rejection alert.
     */
    fileAlert?: IFileAlert;
    /**
     * Dismisses the file rejection alert.
     */
    dismissFileAlert: () => void;
    /**
     * Whether any attachment is still uploading (gates sending and issue creation).
     */
    isUploading: boolean;
    /**
     * Whether any attachment is being removed (gates issue creation).
     */
    isRemoving: boolean;
    /**
     * Draft text of the composer. Held on the controller (not in the composer component) so it
     * survives closing and reopening the drawer, whose content unmounts while closed.
     */
    composerInput: string;
    /**
     * Updates the composer draft.
     */
    setComposerInput: (value: string) => void;
}

export const useAssistantChatController = (
    params: IUseAssistantChatControllerParams,
): IAssistantChatController => {
    const { assistantUrl, appContext, supportPortalUrl, monitoring } = params;

    const { sessionId, rotate } = useChatSession();

    const chat = useAssistantChat({
        assistantUrl,
        sessionId,
        appContext,
        monitoring,
    });

    const ticket = useTicket({ assistantUrl, monitoring });

    const files = useFileAttachments({ assistantUrl, sessionId, monitoring });

    const [requestHistory, setRequestHistory] = useState<
        IRequestHistoryEntry[]
    >(() => getRequestHistory());

    const [composerInput, setComposerInput] = useState('');

    const { sendMessage: chatSendMessage } = chat;
    const { status: ticketStatus, reset: resetTicket } = ticket;

    const sendMessage = useCallback(
        (text: string) => {
            // One ticket = one chat: a completed session accepts no further messages.
            if (ticketStatus === 'created') {
                return;
            }

            // A newer message makes any prepared preview stale: the user reviews again.
            resetTicket();
            chatSendMessage(text);
        },
        [ticketStatus, resetTicket, chatSendMessage],
    );

    // Both ticket actions take the full transcript: preview distills it, creation submits the
    // exact conversation the ticket documents.
    const buildTicketRequest = useCallback(
        (): ICreateIssueRequest => ({
            sessionId,
            messages: chat.messages.map((message) => ({
                id: message.id,
                role: message.role === 'user' ? 'user' : 'assistant',
                parts: message.parts,
            })),
            appContext,
        }),
        [sessionId, chat.messages, appContext],
    );

    const prepareTicket = useCallback(
        () => ticket.prepare(buildTicketRequest()),
        [ticket.prepare, buildTicketRequest],
    );

    const { isUploading, isRemoving } = files;

    const createIssue = useCallback(() => {
        // Attachments must be settled: an upload still in flight would miss the ticket, a
        // removal still in flight would wrongly end up in it.
        if (isUploading || isRemoving) {
            return;
        }

        ticket.send(buildTicketRequest());
    }, [isUploading, isRemoving, ticket.send, buildTicketRequest]);

    const startNewChat = useCallback(() => {
        resetTicket();
        setComposerInput('');
        // Attachments reset through their session effect once the new identifier lands.
        rotate();
    }, [resetTicket, rotate]);

    // The created issue is appended to the device-local history exactly once.
    const appendedIssueIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        const createdIssue = ticket.issue;

        if (
            createdIssue == null ||
            appendedIssueIdRef.current === createdIssue.issueId
        ) {
            return;
        }

        appendedIssueIdRef.current = createdIssue.issueId;
        setRequestHistory(
            appendRequestToHistory({
                identifier: createdIssue.identifier,
                url: createdIssue.url,
                summary: ticket.preview?.summary ?? '',
                createdAt: new Date().toISOString(),
            }),
        );
    }, [ticket.issue, ticket.preview]);

    const flowState = deriveFlowState({
        ticketStatus,
        hasMessages: chat.messages.length > 0,
    });

    return {
        sessionId,
        appContext,
        supportPortalUrl,
        messages: chat.visibleMessages,
        chatStatus: chat.status,
        chatError: chat.error,
        sendMessage,
        stop: chat.stop,
        flowState,
        prepareTicket,
        ticketPreview: ticket.preview,
        previewError: ticket.previewError,
        createIssue,
        issue: ticket.issue,
        issueError: ticket.createError,
        startNewChat,
        requestHistory,
        attachments: files.attachments,
        addFiles: files.addFiles,
        removeFile: files.removeFile,
        fileAlert: files.alert,
        dismissFileAlert: files.dismissAlert,
        isUploading,
        isRemoving,
        composerInput,
        setComposerInput,
    };
};

// The flow state is the ticket lifecycle verbatim; only the resting state splits into idle
// (fresh session) and chatting (conversation ongoing).
const flowStateByTicketStatus: Record<
    Exclude<TicketStatus, 'idle'>,
    ChatFlowState
> = {
    previewing: 'previewing',
    previewed: 'previewReady',
    unclear: 'previewUnclear',
    creating: 'creatingIssue',
    created: 'issueCreated',
    error: 'issueError',
};

const deriveFlowState = (params: {
    ticketStatus: TicketStatus;
    hasMessages: boolean;
}): ChatFlowState => {
    const { ticketStatus, hasMessages } = params;

    if (ticketStatus !== 'idle') {
        return flowStateByTicketStatus[ticketStatus];
    }

    return hasMessages ? 'chatting' : 'idle';
};
