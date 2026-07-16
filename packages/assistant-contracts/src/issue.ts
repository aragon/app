import { z } from 'zod';
import { chatRequestSchema, supportIntentSchema } from './chat';

// The preview is the single extraction point: the server distills the full transcript into the
// ticket fields, stores them as the session's snapshot and returns what the user gets to review.
// Creation then happens strictly from that snapshot — the reviewed preview and the created ticket
// can never disagree.
export const previewIssueRequestSchema = chatRequestSchema;

export type IPreviewIssueRequest = z.infer<typeof previewIssueRequestSchema>;

// 'unclear' means the conversation does not describe an actionable request yet (no summary and
// description could be distilled) — the user keeps chatting and previews again. Only the summary
// is reviewed (it becomes the ticket title); the description can be long and stays server-side.
export const previewIssueResponseSchema = z.discriminatedUnion('status', [
    z.object({
        status: z.literal('ready'),
        summary: z.string(),
        intent: supportIntentSchema,
    }),
    z.object({ status: z.literal('unclear') }),
]);

export type IPreviewIssueResponse = z.infer<typeof previewIssueResponseSchema>;

// Attachments are never sent by the client — the server resolves them from its own per-session
// store, and the ticket fields come from the stored preview snapshot.
export const createIssueRequestSchema = chatRequestSchema;

export type ICreateIssueRequest = z.infer<typeof createIssueRequestSchema>;

export const createIssueResponseSchema = z.object({
    issueId: z.string(),
    // Human-readable reference, e.g. SUP-123.
    identifier: z.string(),
    url: z.string(),
    // True when the session already created its issue and this call was an idempotent retry.
    alreadyExisted: z.boolean(),
});

export type ICreateIssueResponse = z.infer<typeof createIssueResponseSchema>;
