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
    // Server-to-server endpoints (/analysis/*): missing or wrong bearer secret.
    'unauthorized',
    // The caller speaks another version of the proposal-analysis contract than this deployment.
    'contract_version_mismatch',
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
