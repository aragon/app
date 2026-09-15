import { assistantLimits } from '@aragon/assistant-contracts';
import { fileTypeFromBuffer } from 'file-type';

// Server-side validation is the source of truth (the widget filter is UX only): binary types are
// allowlisted by magic bytes, never by the client-provided name or content type.
const allowedMagicTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
};

// Text formats carry no magic bytes: allowlisted by extension + a strict UTF-8 decode.
const textExtensions = new Set(['txt', 'log', 'md', 'json']);

export interface IValidatedFile {
    data: Uint8Array;
    filename: string;
    // Derived from sniffing, never from the client.
    contentType: string;
    size: number;
}

export type IFileValidationError = 'file_too_large' | 'unsupported_file';

const maxFilenameLength = 120;

export const sanitizeFilename = (raw: string): string => {
    const withoutPath = raw.normalize('NFC').split(/[/\\]/).pop() ?? '';
    // Control chars (Cc) and invisible format chars (Cf) both go: a support engineer reads this
    // name in the ticket, and a bidi override (U+202E) renders `invoice<RLO>gnp.exe` as
    // `invoiceexe.png`. Cf also covers zero-width characters used to make two names look
    // identical. Side effect: emoji joined by ZWJ render as their separate parts.
    const cleaned = withoutPath.replace(/[\p{Cc}\p{Cf}]/gu, '').trim();

    if (cleaned.length === 0 || cleaned === '.' || cleaned === '..') {
        return 'file';
    }
    if (cleaned.length <= maxFilenameLength) {
        return cleaned;
    }

    // Cap the length but keep the extension.
    const extensionIndex = cleaned.lastIndexOf('.');
    const extension = extensionIndex > 0 ? cleaned.slice(extensionIndex) : '';
    const base = cleaned.slice(0, maxFilenameLength - extension.length);

    return `${base}${extension}`;
};

const getExtension = (filename: string): string =>
    filename.includes('.')
        ? (filename.split('.').pop()?.toLowerCase() ?? '')
        : '';

const isValidUtf8Text = (data: Uint8Array): boolean => {
    if (data.includes(0)) {
        return false;
    }
    try {
        new TextDecoder('utf-8', { fatal: true }).decode(data);

        return true;
    } catch {
        return false;
    }
};

export const validateFile = async (
    data: Uint8Array,
    rawFilename: string,
): Promise<IValidatedFile | { error: IFileValidationError }> => {
    if (data.byteLength > assistantLimits.maxFileSizeBytes) {
        return { error: 'file_too_large' };
    }

    const filename = sanitizeFilename(rawFilename);
    const magicType = await fileTypeFromBuffer(data);

    if (magicType != null) {
        const contentType = allowedMagicTypes[magicType.ext];

        // Everything sniffable but not allowlisted (svg/xml included) is rejected here. Accepted
        // files then go through the malware scan in /files/confirm (see files.ts); NSFW/illegal
        // content moderation stays deterrence + reactive review — see README.md.
        return contentType == null
            ? { error: 'unsupported_file' }
            : { data, filename, contentType, size: data.byteLength };
    }

    const isAllowedText =
        textExtensions.has(getExtension(filename)) && isValidUtf8Text(data);

    return isAllowedText
        ? { data, filename, contentType: 'text/plain', size: data.byteLength }
        : { error: 'unsupported_file' };
};
