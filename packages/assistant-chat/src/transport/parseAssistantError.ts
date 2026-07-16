import {
    assistantErrorSchema,
    type IAssistantError,
} from '@aragon/assistant-contracts';

/**
 * Extracts the assistant service error shape from a chat transport error, when present. Covers
 * both failure paths: non-2xx responses (the AI SDK throws with the response body as the Error
 * message) and mid-stream failures (the service encodes the same shape into the stream error
 * part). Returns null for anything else — network failures, aborts, foreign errors.
 */
export const parseAssistantError = (
    error: unknown,
): IAssistantError['error'] | null => {
    if (!(error instanceof Error)) {
        return null;
    }

    try {
        const parsed = assistantErrorSchema.safeParse(
            JSON.parse(error.message),
        );

        return parsed.success ? parsed.data.error : null;
    } catch {
        return null;
    }
};
