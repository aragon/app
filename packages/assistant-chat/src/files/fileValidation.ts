import { assistantLimits } from '@aragon/assistant-contracts';

// Client-side mirror of the server allowlist (magic-byte validation stays server-side): binary
// types identified by MIME, text files by extension since browsers often report them as empty
// or text/plain.
const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/pdf',
];

const allowedTextExtensions = ['.txt', '.log', '.md', '.json'];

/**
 * Accept map for react-dropzone, mirroring the client-side allowlist.
 */
export const dropzoneAccept: Record<string, string[]> = {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'text/plain': allowedTextExtensions,
};

export type FileRejectReason = 'too_large' | 'unsupported' | 'file_limit';

export interface IRejectedFile {
    /**
     * The rejected file.
     */
    file: File;
    /**
     * Why the file was rejected.
     */
    reason: FileRejectReason;
}

export interface IFileValidationResult {
    /**
     * Files passing the client-side filter, capped to the remaining session slots.
     */
    accepted: File[];
    /**
     * Files rejected client-side with the reason of the first failed check.
     */
    rejected: IRejectedFile[];
}

const isSupportedFile = (file: File): boolean => {
    if (allowedMimeTypes.includes(file.type)) {
        return true;
    }

    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    return allowedTextExtensions.includes(extension);
};

/**
 * Filters the given files against the shared limits: type allowlist, max size and the remaining
 * attachment slots of the session.
 */
export const validateFiles = (
    files: File[],
    remainingSlots: number,
): IFileValidationResult => {
    const accepted: File[] = [];
    const rejected: IRejectedFile[] = [];

    for (const file of files) {
        if (!isSupportedFile(file)) {
            rejected.push({ file, reason: 'unsupported' });
        } else if (file.size > assistantLimits.maxFileSizeBytes) {
            rejected.push({ file, reason: 'too_large' });
        } else if (accepted.length >= remainingSlots) {
            rejected.push({ file, reason: 'file_limit' });
        } else {
            accepted.push(file);
        }
    }

    return { accepted, rejected };
};
