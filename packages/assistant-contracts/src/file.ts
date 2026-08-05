import { z } from 'zod';

// Upload flow: the widget asks the service for a client-upload token (vendor protocol of
// @vercel/blob), uploads the bytes DIRECTLY to blob storage (the service never proxies file
// bodies — Vercel functions cap request bodies at 4.5 MB), then confirms the upload so the
// service can validate the content and queue the file for the ticket.

// The bytes of a queued file never travel with the conversation, but the model must see WHERE an
// attachment arrived, so the message that carried it keeps a part naming the file. It rides as a
// data part on purpose: an AI SDK service that does not know this part drops it, so the widget can
// ship ahead of the service without breaking a turn that carries an attachment.
// Shape: `{ type: 'data-attachment', data: { filename } }`.
export const attachmentPartType = 'data-attachment';

export const confirmFileRequestSchema = z.object({
    sessionId: z.uuid(),
    // URL returned by the blob client upload; the server only accepts URLs of its own store
    // under the session's prefix, so foreign content cannot be smuggled into a ticket.
    blobUrl: z.url(),
});

export type IConfirmFileRequest = z.infer<typeof confirmFileRequestSchema>;

export const deleteFileRequestSchema = z.object({
    sessionId: z.uuid(),
});

export type IDeleteFileRequest = z.infer<typeof deleteFileRequestSchema>;

// The response deliberately never exposes storage URLs: the file queue lives server-side in the
// per-session store, and files reach Linear only when the ticket is created.
export const uploadFileResponseSchema = z.object({
    // Server identifier of the queued file; used to delete it from the session again.
    id: z.string(),
    // Sanitized filename echoed back for display.
    filename: z.string(),
    // Sniffed content type (never the client-provided one).
    contentType: z.string(),
    size: z.number(),
});

export type IUploadFileResponse = z.infer<typeof uploadFileResponseSchema>;
