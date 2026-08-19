import { z } from 'zod';

export const assistantErrorCodeSchema = z.enum([
    'validation',
    'rate_limited',
    'session_limit',
    'upstream_rate_limited',
    'turn_limit',
    'token_budget',
    'file_too_large',
    'file_limit',
    'unsupported_file',
    // The malware scan flagged the file: it was deleted and never reaches the ticket queue.
    'malicious_file',
    // A mandatory scan engine could not deliver a verdict (outage, timeout): retriable.
    'scan_unavailable',
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
