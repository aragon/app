import {
    attachmentPartType,
    type IAppContext,
    type IChatRequest,
} from '@aragon/assistant-contracts';
import { DefaultChatTransport } from 'ai';
import type { AssistantUIMessage } from './chatTransport.api';

export interface ICreateChatTransportParams {
    /**
     * Base URL of the assistant service.
     */
    assistantUrl: string;
    /**
     * Returns the identifier of the current chat session.
     */
    getSessionId: () => string;
    /**
     * Returns the app context sent alongside every request.
     */
    getAppContext: () => IAppContext;
}

// A file part carries the whole file inline as a data URL (the local transcript renders its
// preview from it) and the service already holds the bytes for the ticket, so only the name
// travels with the conversation — enough for the service to tell the model where an attachment
// arrived, without pushing megabytes through every turn.
const toRequestPart = (part: AssistantUIMessage['parts'][number]) =>
    part.type === 'file'
        ? { type: attachmentPartType, data: { filename: part.filename } }
        : part;

// The server re-validates against chatRequestSchema; only the fields of the contract are sent
// (the default AI SDK body would leak chat id / trigger metadata).
const buildRequestBody = (
    params: ICreateChatTransportParams,
    messages: AssistantUIMessage[],
): IChatRequest => ({
    sessionId: params.getSessionId(),
    messages: messages.map((message) => ({
        id: message.id,
        role: message.role === 'user' ? 'user' : 'assistant',
        parts: message.parts.map(toRequestPart),
    })),
    appContext: params.getAppContext(),
});

export const createChatTransport = (params: ICreateChatTransportParams) =>
    new DefaultChatTransport<AssistantUIMessage>({
        api: `${params.assistantUrl}/chat`,
        prepareSendMessagesRequest: ({ messages }) => ({
            body: buildRequestBody(params, messages),
        }),
    });
