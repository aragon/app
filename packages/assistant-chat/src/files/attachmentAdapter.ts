import type {
    Attachment,
    AttachmentAdapter,
    PendingAttachment,
} from '@assistant-ui/react';
import { chatCopy } from '../copy';
import type { IChatMonitoring } from '../monitoring';
import { attachmentAccept, validateFiles } from './fileValidation';
import {
    deleteFile,
    type IUploadFileHandle,
    UploadFileError,
    uploadFile,
} from './uploadFile';

export interface ICreateAttachmentAdapterParams {
    /**
     * Base URL of the assistant service.
     */
    assistantUrl: string;
    /**
     * Returns the identifier of the current chat session.
     */
    getSessionId: () => string;
    /**
     * Reports removal failures; the only monitoring signal the adapter emits.
     */
    logError: IChatMonitoring['logError'];
}

interface IAdapterEntry {
    /**
     * Session the file was uploaded in; removal must target the same session and its slot.
     */
    sessionId: string;
    /**
     * Upload handle while the transfer is in flight, used to abort on removal.
     */
    handle?: IUploadFileHandle;
    /**
     * Settles when the upload finished; send() awaits it so a message can be sent while a file is
     * still transferring.
     */
    uploadPromise?: Promise<void>;
    /**
     * Server identifier of the queued file once confirmed, used to delete it again.
     */
    serverId?: string;
    /**
     * Set when the upload was rejected (validation, malware scan) or failed. The entry is kept
     * so `send` can refuse to attach a file the server does not hold, but it no longer occupies
     * a composer slot.
     */
    uploadError?: unknown;
}

const toAttachmentType = (file: File): string =>
    file.type.startsWith('image/') ? 'image' : 'document';

const toFileDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

const toUploadErrorText = (error: unknown): string => {
    if (!(error instanceof UploadFileError)) {
        return chatCopy.fileAlerts.uploadFailed;
    }

    // Scan outcomes get our own wording: the service message describes what was detected, which
    // is neither actionable for the user nor safe to echo verbatim into the chat.
    if (error.code === 'malicious_file') {
        return chatCopy.fileAlerts.maliciousFile;
    }

    if (error.code === 'scan_unavailable') {
        return chatCopy.fileAlerts.scanUnavailable;
    }

    // Other service rejections (magic-byte validation, session limits) carry a human-readable
    // message; anything else (network failures, unexpected shapes) falls back to the generic
    // wording.
    return error.code === 'network' || error.code === 'internal'
        ? chatCopy.fileAlerts.uploadFailed
        : error.message;
};

/**
 * assistant-ui attachment adapter over the widget's file endpoints. Files travel out-of-band: the
 * upload queues the file server-side for the ticket, the message parts produced by `send` only
 * feed the local transcript preview and are stripped from requests by the chat transport. The
 * client-side slot bookkeeping caps how many files ride along with one message; the server's
 * per-session queue cap stays the abuse authority.
 */
export const createAttachmentAdapter = (
    params: ICreateAttachmentAdapterParams,
): AttachmentAdapter => {
    const { assistantUrl, getSessionId, logError } = params;

    const entries = new Map<string, IAdapterEntry>();

    // Files sitting in the composer: entries are dropped again when their message is sent, so the
    // cap applies per message, not per session.
    const usedSlots = (sessionId: string): number =>
        [...entries.values()].filter(
            (entry) =>
                entry.sessionId === sessionId && entry.uploadError == null,
        ).length;

    return {
        accept: attachmentAccept,
        async *add({
            file,
        }: {
            file: File;
        }): AsyncGenerator<PendingAttachment, void> {
            const sessionId = getSessionId();
            const id = crypto.randomUUID();

            const attachment: PendingAttachment = {
                id,
                type: toAttachmentType(file),
                name: file.name,
                contentType: file.type,
                file,
                status: { type: 'running', reason: 'uploading', progress: 0 },
            };

            // Rejections surface on the attachment tile (the runtime turns a thrown error into
            // the tile's error state), so the pending tile is yielded before validating.
            yield attachment;

            const { rejected } = validateFiles([file], {
                usedSlots: usedSlots(sessionId),
            });

            if (rejected[0] != null) {
                throw new Error(chatCopy.fileAlerts[rejected[0].reason]);
            }

            const handle = uploadFile({ assistantUrl, sessionId, file });
            const entry: IAdapterEntry = { sessionId, handle };
            entries.set(id, entry);

            entry.uploadPromise = handle.promise
                .then((response) => {
                    entry.serverId = response.id;
                    entry.handle = undefined;
                })
                .catch((error: unknown) => {
                    // Kept (not deleted) so `send` can tell a rejected file apart from one that
                    // was never picked: the tile stays in the composer showing its error, and the
                    // message cannot be sent until the user removes it.
                    entry.uploadError = error;
                    throw error;
                });

            try {
                await entry.uploadPromise;
            } catch (error) {
                // A removal mid-upload aborts the transfer; the tile is already gone, so the
                // generator just ends instead of resurrecting it as an error state.
                if (
                    error instanceof UploadFileError &&
                    error.code === 'aborted'
                ) {
                    return;
                }

                throw new Error(toUploadErrorText(error));
            }

            yield {
                ...attachment,
                status: { type: 'requires-action', reason: 'composer-send' },
            };
        },
        remove: async (attachment: Attachment): Promise<void> => {
            const entry = entries.get(attachment.id);

            // Unknown ids are tiles that never uploaded (validation rejects): nothing to release.
            if (entry == null) {
                return;
            }

            if (entry.handle != null) {
                entry.handle.abort();
                entries.delete(attachment.id);
                return;
            }

            if (entry.serverId != null) {
                try {
                    await deleteFile({
                        assistantUrl,
                        sessionId: entry.sessionId,
                        fileId: entry.serverId,
                    });
                } catch (error) {
                    logError(error, {
                        context: { step: 'assistantChat.removeFile' },
                    });
                    throw new Error(chatCopy.fileAlerts.removeFailed);
                }
            }

            entries.delete(attachment.id);
        },
        send: async (attachment: PendingAttachment) => {
            const entry = entries.get(attachment.id);

            // The server holds bytes only for uploads it accepted. A rejected one (unsupported
            // type, session limit, malware scan) must never ride along with the message: the
            // send fails so the user removes the tile first, instead of the transcript showing
            // an attachment the support team will never receive.
            if (entry == null) {
                throw new Error(chatCopy.fileAlerts.uploadFailed);
            }

            // Sending while the upload is still in flight waits for it; a rejection landing at
            // this point fails the send for the same reason.
            try {
                await entry.uploadPromise;
            } catch (error) {
                throw new Error(toUploadErrorText(error));
            }

            // The message takes the file with it: the entry no longer occupies a composer slot,
            // and the server queue (bounded by its own session cap) holds it for the ticket.
            entries.delete(attachment.id);

            // The content part exists only for the local transcript: assistant-ui rebuilds the
            // sent message's attachment tiles from it, the chat transport strips file parts from
            // requests, and the server already holds the bytes for the ticket.
            return {
                ...attachment,
                status: { type: 'complete' as const },
                content: [
                    {
                        type: 'file',
                        data: await toFileDataUrl(attachment.file),
                        mimeType:
                            attachment.contentType ?? attachment.file.type,
                        filename: attachment.name,
                    },
                ],
            };
        },
    };
};
