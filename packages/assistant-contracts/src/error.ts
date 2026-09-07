import { z } from 'zod';

export const assistantErrorCodeSchema = z.enum([
    'validation',
    'rate_limited',
    'session_limit',
    'upstream_rate_limited',
    // The model call was cancelled by the service's own wall-clock cap: the upstream stalled
    // without ever failing, so the turn produced no reply at all.
    'timeout',
    'turn_limit',
    'token_budget',
    'file_too_large',
    'file_limit',
    'unsupported_file',
    'internal',
]);

export type IAssistantErrorCode = z.infer<typeof assistantErrorCodeSchema>;

// Body of every non-2xx JSON response of the assistant service.
export const assistantErrorSchema = z.object({
    error: z.object({
        code: assistantErrorCodeSchema,
        message: z.string(),
        details: z.record(z.string(), z.unknown()).optional(),
    }),
});

export type IAssistantError = z.infer<typeof assistantErrorSchema>;
