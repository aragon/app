import {
    assistantLimits,
    confirmFileRequestSchema,
    deleteFileRequestSchema,
    type IAssistantError,
    type IAssistantErrorCode,
    type IUploadFileResponse,
} from '@aragon/assistant-contracts';
import { type HandleUploadBody, handleUpload } from '@vercel/blob/client';
import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z } from 'zod';
import {
    buildBlobPath,
    getStoreIdFromToken,
    parseBlobPath,
    parseSessionBlobUrl,
} from '../files/blobPath';
import type { IFileSanitizeError } from '../files/sanitizeFile';
import { validateFile } from '../files/validateFile';
import type { IAppDependencies } from '../lib/appDependencies';
import { env } from '../lib/env';
import { observability } from '../lib/observability';
import type { ISessionFile } from '../lib/sessionStore';

const errorStatusByCode: Partial<
    Record<IAssistantErrorCode, ContentfulStatusCode>
> = {
    file_too_large: 413,
    unsupported_file: 415,
    file_limit: 429,
    internal: 500,
};

const buildError = (code: IAssistantErrorCode, message: string) => {
    const body: IAssistantError = { error: { code, message } };

    return { body, status: errorStatusByCode[code] ?? 400 };
};

// Wording of the rejection for each reason the sanitizer refuses a file.
const sanitizeErrorMessages: Record<IFileSanitizeError, string> = {
    active_content:
        'The PDF contains scripts, forms, attachments, media or links to other files. Export it as an image or a flat PDF.',
    encrypted:
        'Encrypted PDFs are not supported. Export it as an image or a flat PDF.',
    unreadable: 'The file is damaged or not supported.',
};

// Content types the upload token allows. This is a coarse first gate — the authoritative check
// is the magic-byte validation at confirm time (octet-stream is allowed because browsers often
// report no type for .log/.txt files).
const tokenAllowedContentTypes = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/json',
    'application/octet-stream',
];

const tokenValiditySeconds = 10 * 60;

const clientPayloadSchema = z.object({ sessionId: z.uuid() });

const buildFileResponse = (file: ISessionFile): IUploadFileResponse => ({
    id: file.id,
    filename: file.filename,
    contentType: file.contentType,
    size: file.size,
});

const computeContentHash = async (data: Uint8Array): Promise<string> => {
    const digest = await crypto.subtle.digest('SHA-256', data);

    return Buffer.from(digest).toString('hex');
};

export const buildFilesRoute = (deps: IAppDependencies) =>
    new Hono()
        // Issues a client-upload token (vendor protocol of @vercel/blob/client): the widget
        // uploads bytes directly to blob storage — Vercel functions cap request bodies at
        // 4.5 MB, so file bodies never flow through the service.
        .post('/token', async (context) => {
            const blobToken = env.blobReadWriteToken();

            if (blobToken == null) {
                const { body, status } = buildError(
                    'internal',
                    'File uploads are not configured.',
                );

                return context.json(body, status);
            }

            const requestBody = (await context.req
                .json()
                .catch(() => null)) as HandleUploadBody | null;

            if (requestBody == null) {
                const { body, status } = buildError(
                    'validation',
                    'Invalid upload token request.',
                );

                return context.json(body, status);
            }

            try {
                const result = await handleUpload({
                    body: requestBody,
                    request: context.req.raw,
                    token: blobToken,
                    onBeforeGenerateToken: async (pathname, clientPayload) => {
                        const payload = clientPayloadSchema.safeParse(
                            JSON.parse(clientPayload ?? 'null'),
                        );
                        if (!payload.success) {
                            throw new Error('Invalid session.');
                        }

                        const { sessionId } = payload.data;
                        const parsedPath = parseBlobPath(pathname);
                        if (parsedPath?.sessionId !== sessionId) {
                            throw new Error(
                                'The upload path does not belong to the session.',
                            );
                        }

                        // Soft fail-fast check; the authoritative slot reservation happens at
                        // confirm time.
                        const files = await deps
                            .getSessionStore()
                            .listFiles(sessionId);
                        if (
                            files.length >= assistantLimits.maxFilesPerSession
                        ) {
                            throw new Error(
                                `A session can hold at most ${assistantLimits.maxFilesPerSession} files.`,
                            );
                        }

                        return {
                            allowedContentTypes: tokenAllowedContentTypes,
                            maximumSizeInBytes:
                                assistantLimits.maxFileSizeBytes,
                            addRandomSuffix: false,
                            allowOverwrite: false,
                            validUntil:
                                Date.now() + tokenValiditySeconds * 1000,
                        };
                    },
                });

                return context.json(result);
            } catch (error) {
                const { body, status } = buildError(
                    'validation',
                    error instanceof Error
                        ? error.message
                        : 'Upload token request failed.',
                );

                return context.json(body, status);
            }
        })
        // Confirms a finished blob upload: pins the URL to our store and the session's prefix,
        // downloads the bytes and validates them (magic bytes — the first time the service sees
        // the content), then queues the file for the ticket.
        .post('/confirm', async (context) => {
            const blobToken = env.blobReadWriteToken();
            const storeId =
                blobToken == null ? null : getStoreIdFromToken(blobToken);

            if (storeId == null) {
                const { body, status } = buildError(
                    'internal',
                    'File uploads are not configured.',
                );

                return context.json(body, status);
            }

            const parsed = confirmFileRequestSchema.safeParse(
                await context.req.json().catch(() => null),
            );

            if (!parsed.success) {
                const { body, status } = buildError(
                    'validation',
                    'Invalid confirm request.',
                );

                return context.json(body, status);
            }

            const { sessionId, blobUrl } = parsed.data;
            const parsedPath = parseSessionBlobUrl({
                blobUrl,
                sessionId,
                storeId,
            });

            if (parsedPath == null) {
                const { body, status } = buildError(
                    'validation',
                    'The blob URL does not belong to the session.',
                );

                return context.json(body, status);
            }

            const sessionStore = deps.getSessionStore();
            const { fileId } = parsedPath;

            // Idempotent confirm retry: the file is already queued.
            const existingFile = await sessionStore.getFile(sessionId, fileId);
            if (existingFile != null) {
                return context.json(buildFileResponse(existingFile), 200);
            }

            // Atomic per-file claim: of two concurrent confirms of the same blob exactly one
            // proceeds, so the same file cannot be queued (and later sent to Linear) twice.
            // The loser re-checks the queue — the winner may have finished in the meantime.
            const claimed = await sessionStore.claimFile(sessionId, fileId);
            if (!claimed) {
                const queued = await sessionStore.getFile(sessionId, fileId);
                if (queued != null) {
                    return context.json(buildFileResponse(queued), 200);
                }

                const { body, status } = buildError(
                    'validation',
                    'The file is already being confirmed.',
                );

                return context.json(body, status);
            }

            const buildFileLimitError = () =>
                buildError(
                    'file_limit',
                    `A session can hold at most ${assistantLimits.maxFilesPerSession} files.`,
                );

            // Fast-fail on a full queue; the authoritative cap check is the addFile length.
            const queuedFiles = await sessionStore.listFiles(sessionId);
            if (queuedFiles.length >= assistantLimits.maxFilesPerSession) {
                await sessionStore.releaseFileClaim(sessionId, fileId);
                const { body, status } = buildFileLimitError();

                return context.json(body, status);
            }

            const startTime = Date.now();

            let data: Uint8Array;
            try {
                data = await deps.getBlobStore().fetchBytes(blobUrl);
            } catch (error) {
                await sessionStore.releaseFileClaim(sessionId, fileId);
                observability.logError(error, {
                    sessionId,
                    step: 'confirmFile',
                });
                const { body, status } = buildError(
                    'validation',
                    'The uploaded file could not be found.',
                );

                return context.json(body, status);
            }

            // Best effort on blob deletion: the cleanup cron sweeps leftovers.
            const deleteBlobs = (urls: string[]) =>
                deps
                    .getBlobStore()
                    .delete(urls)
                    .catch((error: unknown) =>
                        observability.logError(error, {
                            sessionId,
                            step: 'confirmFile',
                        }),
                    );

            // Releases the slot and deletes the blob of a file we are not going to queue.
            const rejectFile = async () => {
                await sessionStore.releaseFileClaim(sessionId, fileId);
                await deleteBlobs([blobUrl]);
            };

            const validated = await validateFile(data, parsedPath.filename);

            if ('error' in validated) {
                await rejectFile();
                const { body, status } = buildError(
                    validated.error,
                    validated.error === 'file_too_large'
                        ? 'The file exceeds the maximum allowed size.'
                        : 'The file type is not supported.',
                );

                return context.json(body, status);
            }

            // Rebuild before queueing: an image or PDF reaches the ticket as bytes the service
            // wrote, text as uploaded after its strict decode. A file the sanitizer refuses is
            // dropped like a failed format check.
            const result = await deps.getFileSanitizer().sanitize(validated);

            if ('error' in result) {
                if (result.cause != null) {
                    observability.logError(result.cause, {
                        sessionId,
                        step: 'confirmFile',
                    });
                }
                await rejectFile();
                const { body, status } = buildError(
                    'unsupported_file',
                    sanitizeErrorMessages[result.error],
                );

                return context.json(body, status);
            }

            const { file: sanitized, rebuilt } = result;

            // The size cap applies to what we store, not only to what was uploaded: a re-encode
            // can grow a file (sharp writes PNGs full-colour, so an indexed screenshot comes
            // back larger). Checked before the store, so an oversized rebuild neither leaves a
            // fresh blob behind nor reaches the ticket transfer, which re-validates and would
            // drop the attachment with nothing but a log line.
            if (sanitized.size > assistantLimits.maxFileSizeBytes) {
                await rejectFile();
                const { body, status } = buildError(
                    'file_too_large',
                    'The file exceeds the maximum allowed size once converted. Save it at a smaller size and attach it again.',
                );

                return context.json(body, status);
            }

            // Rebuilt bytes go under a fresh blob; bytes passed through untouched (text) keep
            // the uploaded blob. The upload is deleted only once the file is queued: every
            // failure before that releases the claim and leaves the upload in place, so the
            // confirm can be retried.
            let storedBlobUrl = blobUrl;
            if (rebuilt) {
                try {
                    const stored = await deps.getBlobStore().put({
                        pathname: buildBlobPath({
                            sessionId,
                            fileId,
                            filename: sanitized.filename,
                        }),
                        data: sanitized.data,
                        contentType: sanitized.contentType,
                    });
                    storedBlobUrl = stored.url;
                } catch (error) {
                    await sessionStore.releaseFileClaim(sessionId, fileId);
                    observability.logError(error, {
                        sessionId,
                        step: 'confirmFile',
                    });
                    const { body, status } = buildError(
                        'internal',
                        'The file could not be stored.',
                    );

                    return context.json(body, status);
                }
            }

            // Re-attached identical bytes (e.g. the same screenshot uploaded twice) queue as
            // their own entry: every composer tile owns its fileId and blob, so removing one
            // never orphans another. The ticket still carries the content once — the transfer
            // to Linear deduplicates by this hash at creation time.
            const contentHash = await computeContentHash(sanitized.data);

            const file: ISessionFile = {
                id: fileId,
                blobUrl: storedBlobUrl,
                filename: sanitized.filename,
                contentType: sanitized.contentType,
                size: sanitized.size,
                contentHash,
            };

            // The RPUSH length is atomic, so concurrent confirms of different files get
            // distinct lengths and the cap holds exactly; an over-cap add removes itself
            // (removeFile also drops the claim). A failed write drops the fresh blob too.
            let queueLength: number;
            try {
                queueLength = await sessionStore.addFile(sessionId, file);
            } catch (error) {
                await sessionStore.releaseFileClaim(sessionId, fileId);
                if (rebuilt) {
                    await deleteBlobs([storedBlobUrl]);
                }
                observability.logError(error, {
                    sessionId,
                    step: 'confirmFile',
                });
                const { body, status } = buildError(
                    'internal',
                    'The file could not be queued.',
                );

                return context.json(body, status);
            }
            if (queueLength > assistantLimits.maxFilesPerSession) {
                await sessionStore.removeFile(sessionId, fileId);
                await deleteBlobs(
                    rebuilt ? [blobUrl, storedBlobUrl] : [blobUrl],
                );
                const { body, status } = buildFileLimitError();

                return context.json(body, status);
            }

            if (rebuilt) {
                await deleteBlobs([blobUrl]);
            }

            observability.logStep({
                sessionId,
                step: 'confirmFile',
                latencyMs: Date.now() - startTime,
            });

            return context.json(buildFileResponse(file), 201);
        })
        // Removes a queued file: it will not be part of the ticket and its slot frees up.
        // Idempotent — deleting an unknown id is a no-op.
        .delete('/:fileId', async (context) => {
            const startTime = Date.now();
            const parsed = deleteFileRequestSchema.safeParse(
                await context.req.json().catch(() => null),
            );

            if (!parsed.success) {
                const { body, status } = buildError(
                    'validation',
                    'Invalid delete request.',
                );

                return context.json(body, status);
            }

            const { sessionId } = parsed.data;
            const fileId = context.req.param('fileId');

            const removed = await deps
                .getSessionStore()
                .removeFile(sessionId, fileId);

            if (removed != null) {
                await deps
                    .getBlobStore()
                    .delete([removed.blobUrl])
                    .catch((error: unknown) =>
                        observability.logError(error, {
                            sessionId,
                            step: 'removeFile',
                        }),
                    );
                observability.logStep({
                    sessionId,
                    step: 'removeFile',
                    latencyMs: Date.now() - startTime,
                });
            }

            return context.body(null, 204);
        });
