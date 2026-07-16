import type { IAppContext, IChatRequest } from '@aragon/assistant-contracts';
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
        parts: message.parts,
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
