import type { MpcLocalizedText } from '@/modules/mpc/api/mpcService/domain';

/**
 * Resolves a catalog text (plain string or bilingual `{ es, en }`) to the app language (English). Falls back to
 * the first non-empty value so an incomplete catalog entry still renders something.
 */
export const localizedText = (
    text: MpcLocalizedText | null | undefined,
): string => {
    if (text == null) {
        return '';
    }

    if (typeof text === 'string') {
        return text;
    }

    if (text.en.length > 0) {
        return text.en;
    }

    return text.es;
};

/**
 * Duration in seconds -> short human readable text (e.g. "2 h", "1 d").
 */
export const formatDurationSeconds = (
    seconds: number,
    noneLabel: string,
): string => {
    if (!seconds) {
        return noneLabel;
    }

    if (seconds % 86_400 === 0) {
        return `${(seconds / 86_400).toString()} d`;
    }

    if (seconds % 3600 === 0) {
        return `${(seconds / 3600).toString()} h`;
    }

    if (seconds % 60 === 0) {
        return `${(seconds / 60).toString()} min`;
    }

    return `${seconds.toString()} s`;
};
