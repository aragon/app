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
 * Accept string of the attachment adapter (native file-input format), mirroring the client-side
 * allowlist. The runtime also pre-filters dropped and pasted files against it.
 */
export const attachmentAccept = [
    ...allowedMimeTypes,
    ...allowedTextExtensions,
].join(',');

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
     * Files passing the client-side filter, capped to the remaining slots of the message.
     */
    accepted: File[];
    /**
     * Files rejected client-side with the reason of the first failed check.
     */
    rejected: IRejectedFile[];
}

export interface IValidateFilesOptions {
    /**
     * Attachment slots the message being composed has already used.
     */
    usedSlots: number;
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
 * attachment slots of the message being composed.
 */
export const validateFiles = (
    files: File[],
    options: IValidateFilesOptions,
): IFileValidationResult => {
    const remainingSlots =
        assistantLimits.maxFilesPerMessage - options.usedSlots;

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
