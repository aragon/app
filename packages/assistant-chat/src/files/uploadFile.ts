import {
    assistantErrorSchema,
    type IAssistantErrorCode,
    type IUploadFileResponse,
    uploadFileResponseSchema,
} from '@aragon/assistant-contracts';
import { upload } from '@vercel/blob/client';

export type UploadFileErrorCode = IAssistantErrorCode | 'network' | 'aborted';

export class UploadFileError extends Error {
    readonly code: UploadFileErrorCode;

    constructor(
        code: UploadFileErrorCode,
        message: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
        this.name = 'UploadFileError';
        this.code = code;
    }
}

export interface IUploadFileParams {
    /**
     * Base URL of the assistant service.
     */
    assistantUrl: string;
    /**
     * Identifier of the current chat session.
     */
    sessionId: string;
    /**
     * File to upload.
     */
    file: File;
}

export interface IUploadFileHandle {
    /**
     * Resolves with the upload response; rejects with an UploadFileError.
     */
    promise: Promise<IUploadFileResponse>;
    /**
     * Aborts the in-flight upload; the promise rejects with code `aborted`.
     */
    abort: () => void;
}

export interface IDeleteFileParams {
    /**
     * Base URL of the assistant service.
     */
    assistantUrl: string;
    /**
     * Identifier of the current chat session.
     */
    sessionId: string;
    /**
     * Server identifier of the queued file, as returned by the upload.
     */
    fileId: string;
}

const parseErrorBody = (body: unknown): UploadFileError => {
    const parsed = assistantErrorSchema.safeParse(body);

    return parsed.success
        ? new UploadFileError(parsed.data.error.code, parsed.data.error.message)
        : new UploadFileError('internal', 'The file could not be uploaded.');
};

const toUploadFileError = (
    error: unknown,
    isAborted: boolean,
): UploadFileError => {
    if (isAborted) {
        return new UploadFileError('aborted', 'Upload aborted.');
    }

    if (error instanceof UploadFileError) {
        return error;
    }

    if (error instanceof TypeError) {
        return new UploadFileError('network', 'Network error during upload.');
    }

    return new UploadFileError(
        'internal',
        error instanceof Error
            ? error.message
            : 'The file could not be uploaded.',
    );
};

const confirmUpload = async (
    params: IUploadFileParams,
    blobUrl: string,
    signal: AbortSignal,
): Promise<IUploadFileResponse> => {
    const { assistantUrl, sessionId } = params;

    const response = await fetch(`${assistantUrl}/files/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, blobUrl }),
        signal,
    });

    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        throw parseErrorBody(body);
    }

    try {
        return uploadFileResponseSchema.parse(body);
    } catch (error) {
        // biome-ignore lint/style/useErrorCause: the cause is forwarded through the options argument.
        throw new UploadFileError('internal', 'Unexpected upload response.', {
            cause: error,
        });
    }
};

// Two-step client-direct upload (Vercel functions cap request bodies at 4.5 MB, so file bytes
// never flow through the service): the blob client asks POST /files/token for a client token,
// uploads the bytes directly to blob storage, then POST /files/confirm lets the service
// validate the content and queue the file for the ticket.
export const uploadFile = (params: IUploadFileParams): IUploadFileHandle => {
    const { assistantUrl, sessionId, file } = params;

    const abortController = new AbortController();
    const { signal } = abortController;

    // The pathname contract of POST /files/token: the raw file name stays last so the server
    // can derive the display name; the uuid segment becomes the server file id.
    const pathname = `assistant/${sessionId}/${crypto.randomUUID()}/${file.name}`;

    const promise = upload(pathname, file, {
        access: 'public',
        handleUploadUrl: `${assistantUrl}/files/token`,
        clientPayload: JSON.stringify({ sessionId }),
        abortSignal: signal,
    })
        .then((blob) => confirmUpload(params, blob.url, signal))
        .catch((error: unknown) => {
            throw toUploadFileError(error, signal.aborted);
        });

    return { promise, abort: () => abortController.abort() };
};

/**
 * Removes a queued file from the session; the server frees its slot and deletes the blob.
 */
export const deleteFile = async (params: IDeleteFileParams): Promise<void> => {
    const { assistantUrl, sessionId, fileId } = params;

    let response: Response;
    try {
        response = await fetch(`${assistantUrl}/files/${fileId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });
    } catch (error) {
        // biome-ignore lint/style/useErrorCause: the cause is forwarded through the options argument.
        throw new UploadFileError('network', 'Network error during removal.', {
            cause: error,
        });
    }

    if (!response.ok) {
        throw parseErrorBody(await response.json().catch(() => null));
    }
};
