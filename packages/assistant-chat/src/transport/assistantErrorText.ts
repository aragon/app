import type { IAssistantErrorCode } from '@aragon/assistant-contracts';
import { chatCopy } from '../copy';

// The human wording for error codes the service is known to send lives in the copy module.
// Unknown codes and foreign errors (network failures, aborts) fall back to the caller's
// context-specific hint.
const errorTextByCode: Partial<Record<IAssistantErrorCode, string>> = {
    rate_limited: chatCopy.serviceErrors.rateLimited,
    session_limit: chatCopy.serviceErrors.sessionLimit,
    upstream_rate_limited: chatCopy.serviceErrors.upstreamRateLimited,
};

/**
 * Resolves the user-facing message for an assistant service error code. Falls back to the given
 * context-specific text for unknown codes and non-service failures.
 */
export const getAssistantErrorText = (
    code: IAssistantErrorCode | undefined,
    fallbackText: string,
): string => (code != null ? errorTextByCode[code] : undefined) ?? fallbackText;
