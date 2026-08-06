import type { UIMessage } from 'ai';

/**
 * UI message shape used by the widget: plain text messages, no metadata and no custom data parts —
 * the stream carries the whole conversation, including the createLinearTicket tool and approval parts.
 */
export type AssistantUIMessage = UIMessage;
