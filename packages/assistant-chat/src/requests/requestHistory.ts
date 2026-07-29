import { z } from 'zod';

const storageKey = 'aragon-assistant:requests';

// The history is a lightweight convenience (deep links to past requests), not a source of
// truth: it is capped, device-local and dropped silently when localStorage is unavailable.
const maxEntries = 20;

const requestHistoryEntrySchema = z.object({
    identifier: z.string(),
    url: z.string(),
    summary: z.string(),
    createdAt: z.string(),
});

const requestHistorySchema = z.array(requestHistoryEntrySchema);

export type IRequestHistoryEntry = z.infer<typeof requestHistoryEntrySchema>;

/**
 * Reads the stored request history, newest first. Returns an empty list when storage is
 * unavailable or holds malformed data.
 */
export const getRequestHistory = (): IRequestHistoryEntry[] => {
    try {
        const raw = localStorage.getItem(storageKey);

        if (raw == null) {
            return [];
        }

        return requestHistorySchema.parse(JSON.parse(raw));
    } catch {
        return [];
    }
};

/**
 * Prepends the given entry to the stored request history and returns the updated list.
 */
export const appendRequestToHistory = (
    entry: IRequestHistoryEntry,
): IRequestHistoryEntry[] => {
    const history = [entry, ...getRequestHistory()].slice(0, maxEntries);

    try {
        localStorage.setItem(storageKey, JSON.stringify(history));
    } catch {
        // Ignore storage failures (e.g. private mode): the entry only lives in memory.
    }

    return history;
};
