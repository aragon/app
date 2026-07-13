import { assistantLimits } from '@aragon/assistant-contracts';
import type { IFileAlert } from '../../files';

const maxFileSizeMb = Math.round(
    assistantLimits.maxFileSizeBytes / (1024 * 1024),
);

// Kept deliberately short and filename-free: the filename is what made the alert wrap into a wall
// of text, and the user can already see which file they just picked.
export const buildFileAlertMessage = (alert: IFileAlert): string => {
    switch (alert.reason) {
        case 'too_large':
            return `File too large (max ${maxFileSizeMb} MB).`;
        case 'unsupported':
            return 'Unsupported file. Use an image, text, log or PDF.';
        case 'remove_failed':
            return "Couldn't remove the file. Please try again.";
        default:
            return `You can attach up to ${assistantLimits.maxFilesPerSession} files.`;
    }
};
