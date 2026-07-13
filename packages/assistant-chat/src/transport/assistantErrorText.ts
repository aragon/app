import type { IAssistantErrorCode } from '@aragon/assistant-contracts';

// Single source of the human wording for error codes the service is known to send. Unknown
// codes and foreign errors (network failures, aborts) fall back to the caller's
// context-specific hint.
const errorTextByCode: Partial<Record<IAssistantErrorCode, string>> = {
    rate_limited:
        "You're going a little too fast. Wait a moment and try again.",
    session_limit:
        "You've reached today's limit for new support chats. Use the support portal to open a new ticket.",
    upstream_rate_limited:
        'The assistant is handling a lot of requests right now. Please try again in a minute.',
};

/**
 * Resolves the user-facing message for an assistant service error code. Falls back to the given
 * context-specific text for unknown codes and non-service failures.
 */
export const getAssistantErrorText = (
    code: IAssistantErrorCode | undefined,
    fallbackText: string,
): string => (code != null ? errorTextByCode[code] : undefined) ?? fallbackText;
