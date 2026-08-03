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
 * Prepends the given entry to the stored request history. Idempotent by ticket identifier, so
 * callers may re-append on re-renders without creating duplicates.
 */
export const appendRequestToHistory = (entry: IRequestHistoryEntry): void => {
    const history = getRequestHistory();

    if (history.some((known) => known.identifier === entry.identifier)) {
        return;
    }

    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify([entry, ...history].slice(0, maxEntries)),
        );
    } catch {
        // Ignore storage failures (e.g. private mode): the history is a convenience only.
    }
};
