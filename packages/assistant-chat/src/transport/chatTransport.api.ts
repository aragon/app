import type { UIMessage } from 'ai';

/**
 * UI message shape used by the widget: plain text messages, no metadata and no custom data parts —
 * the stream carries the conversation only, ticket state lives behind the explicit preview flow.
 */
export type AssistantUIMessage = UIMessage;

export type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';
