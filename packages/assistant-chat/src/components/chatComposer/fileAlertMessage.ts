import { assistantLimits } from '@aragon/assistant-contracts';
import { chatCopy } from '../../copy';
import type { IFileAlert } from '../../files';

const maxFileSizeMb = Math.round(
    assistantLimits.maxFileSizeBytes / (1024 * 1024),
);

// Kept deliberately short and filename-free: the filename is what made the alert wrap into a wall
// of text, and the user can already see which file they just picked.
export const buildFileAlertMessage = (alert: IFileAlert): string => {
    switch (alert.reason) {
        case 'too_large':
            return chatCopy.fileAlerts.tooLarge(maxFileSizeMb);
        case 'unsupported':
            return chatCopy.fileAlerts.unsupported;
        case 'remove_failed':
            return chatCopy.fileAlerts.removeFailed;
        default:
            return chatCopy.fileAlerts.tooMany(
                assistantLimits.maxFilesPerSession,
            );
    }
};
