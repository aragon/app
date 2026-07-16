import { assistantLimits } from '@aragon/assistant-contracts';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { IChatMonitoring } from '../monitoring';
import type { FileRejectReason } from './fileValidation';
import { validateFiles } from './fileValidation';
import {
    deleteFile,
    type IUploadFileHandle,
    UploadFileError,
    uploadFile,
} from './uploadFile';

export type ChatAttachmentStatus =
    | 'uploading'
    | 'uploaded'
    | 'removing'
    | 'error';

export type ChatFileAlertReason = FileRejectReason | 'remove_failed';

export interface IChatAttachment {
    /**
     * Client-side identifier of the attachment.
     */
    id: string;
    /**
     * Server identifier of the queued file, set once the upload is confirmed.
     */
    serverId?: string;
    /**
     * Name of the attached file.
     */
    filename: string;
    /**
     * Size of the attached file in bytes.
     */
    size: number;
    /**
     * Upload state of the attachment.
     */
    status: ChatAttachmentStatus;
    /**
     * Upload progress in the [0, 1] range.
     */
    progress: number;
}

export interface IFileAlert {
    /**
     * Why the file was rejected or could not be removed.
     */
    reason: ChatFileAlertReason;
    /**
     * Name of the affected file, when the alert concerns a single file.
     */
    filename?: string;
}

export interface IUseFileAttachmentsParams {
    /**
     * Base URL of the assistant service.
     */
    assistantUrl: string;
    /**
     * Identifier of the current chat session; changing it resets all attachments.
     */
    sessionId: string;
    /**
     * Monitoring implementation used to report upload errors.
     */
    monitoring: IChatMonitoring;
}

export interface IUseFileAttachmentsResult {
    /**
     * Attachments of the current session.
     */
    attachments: IChatAttachment[];
    /**
     * Validates and uploads the given files; single entry point for picker, drag-and-drop and
     * clipboard paste.
     */
    addFiles: (files: File[]) => void;
    /**
     * Removes an attachment: an in-flight upload is aborted, a confirmed one is deleted from the
     * session server-side and restored on failure.
     */
    removeFile: (id: string) => void;
    /**
     * Client-side rejection alert to surface in the composer.
     */
    alert?: IFileAlert;
    /**
     * Dismisses the rejection alert.
     */
    dismissAlert: () => void;
    /**
     * Whether any attachment is still uploading (gates sending).
     */
    isUploading: boolean;
    /**
     * Whether any attachment is being removed (gates issue creation).
     */
    isRemoving: boolean;
}

export const useFileAttachments = (
    params: IUseFileAttachmentsParams,
): IUseFileAttachmentsResult => {
    const { assistantUrl, sessionId, monitoring } = params;

    const [attachments, setAttachments] = useState<IChatAttachment[]>([]);
    const [alert, setAlert] = useState<IFileAlert | undefined>(undefined);

    const uploadHandlesRef = useRef<Map<string, IUploadFileHandle>>(new Map());
    const monitoringRef = useRef(monitoring);
    monitoringRef.current = monitoring;
    const attachmentsRef = useRef(attachments);
    attachmentsRef.current = attachments;

    // A new session starts with a clean slate; uploads of the previous session are aborted.
    const previousSessionIdRef = useRef(sessionId);
    useEffect(() => {
        if (previousSessionIdRef.current === sessionId) {
            return;
        }

        previousSessionIdRef.current = sessionId;
        for (const handle of uploadHandlesRef.current.values()) {
            handle.abort();
        }
        uploadHandlesRef.current.clear();
        setAttachments([]);
        setAlert(undefined);
    }, [sessionId]);

    const updateAttachment = useCallback(
        (id: string, patch: Partial<IChatAttachment>) =>
            setAttachments((current) =>
                current.map((attachment) =>
                    attachment.id === id
                        ? { ...attachment, ...patch }
                        : attachment,
                ),
            ),
        [],
    );

    const startUpload = useCallback(
        (id: string, file: File) => {
            const handle = uploadFile({
                assistantUrl,
                sessionId,
                file,
                onProgress: (progress) => updateAttachment(id, { progress }),
            });
            uploadHandlesRef.current.set(id, handle);

            handle.promise
                .then((response) => {
                    updateAttachment(id, {
                        status: 'uploaded',
                        progress: 1,
                        serverId: response.id,
                    });
                })
                .catch((error: unknown) => {
                    if (
                        error instanceof UploadFileError &&
                        error.code === 'aborted'
                    ) {
                        return;
                    }

                    updateAttachment(id, { status: 'error' });

                    if (
                        error instanceof UploadFileError &&
                        error.code === 'file_limit'
                    ) {
                        setAlert({ reason: 'file_limit', filename: file.name });
                    }

                    monitoringRef.current.logError(error, {
                        context: { step: 'assistantChat.uploadFile' },
                    });
                })
                .finally(() => uploadHandlesRef.current.delete(id));
        },
        [assistantUrl, sessionId, updateAttachment],
    );

    const addFiles = useCallback(
        (files: File[]) => {
            if (files.length === 0) {
                return;
            }

            const activeCount = attachmentsRef.current.filter(
                (attachment) => attachment.status !== 'error',
            ).length;
            const remainingSlots = Math.max(
                0,
                assistantLimits.maxFilesPerSession - activeCount,
            );

            const { accepted, rejected } = validateFiles(files, remainingSlots);

            const firstRejection = rejected[0];
            setAlert(
                firstRejection
                    ? {
                          reason: firstRejection.reason,
                          filename: firstRejection.file.name,
                      }
                    : undefined,
            );

            const added = accepted.map((file) => {
                const id = crypto.randomUUID();
                startUpload(id, file);

                return {
                    id,
                    filename: file.name,
                    size: file.size,
                    status: 'uploading' as const,
                    progress: 0,
                };
            });

            if (added.length > 0) {
                setAttachments((current) => [...current, ...added]);
            }
        },
        [startUpload],
    );

    const removeFile = useCallback(
        (id: string) => {
            const attachment = attachmentsRef.current.find(
                (current) => current.id === id,
            );

            if (attachment == null || attachment.status === 'removing') {
                return;
            }

            // Not confirmed server-side (still uploading or failed): dropping the row is enough,
            // an in-flight upload is aborted.
            if (attachment.serverId == null) {
                uploadHandlesRef.current.get(id)?.abort();
                uploadHandlesRef.current.delete(id);
                setAttachments((current) =>
                    current.filter((entry) => entry.id !== id),
                );

                return;
            }

            const { serverId, filename } = attachment;
            const removalSessionId = sessionId;
            updateAttachment(id, { status: 'removing' });

            deleteFile({ assistantUrl, sessionId, fileId: serverId })
                .then(() =>
                    setAttachments((current) =>
                        current.filter((entry) => entry.id !== id),
                    ),
                )
                .catch((error: unknown) => {
                    // The session rotated while the removal was in flight: its attachments are
                    // already gone, there is nothing to restore.
                    if (previousSessionIdRef.current !== removalSessionId) {
                        return;
                    }

                    updateAttachment(id, { status: 'uploaded' });
                    setAlert({ reason: 'remove_failed', filename });
                    monitoringRef.current.logError(error, {
                        context: { step: 'assistantChat.removeFile' },
                    });
                });
        },
        [assistantUrl, sessionId, updateAttachment],
    );

    const dismissAlert = useCallback(() => setAlert(undefined), []);

    const isUploading = attachments.some(
        (attachment) => attachment.status === 'uploading',
    );
    const isRemoving = attachments.some(
        (attachment) => attachment.status === 'removing',
    );

    return {
        attachments,
        addFiles,
        removeFile,
        alert,
        dismissAlert,
        isUploading,
        isRemoving,
    };
};
