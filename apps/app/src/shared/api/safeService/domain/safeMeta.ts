import { isRecord } from './safeDomainUtils';

/**
 * Provenance and freshness of a Safe read, emitted by `/v2/safe/*` on every payload.
 */
export interface ISafeMeta {
    /**
     * Where the backend got the data. Observability only — never branch on it. `chain` means it came
     * from contract reads and cost no Safe transaction service quota.
     */
    source: string;
    /**
     * ISO timestamp of the upstream read the payload came from.
     */
    fetchedAt: string;
    /**
     * The backend's fresh window lapsed and this came from its stale window. **Render it, do not
     * discard it** — an old queue beats a dead signing UI. Surfaced to the user so a stale
     * confirmation count is never mistaken for a current one.
     */
    stale: boolean;
}

export const isSafeMeta = (value: unknown): value is ISafeMeta =>
    isRecord(value) &&
    typeof value.source === 'string' &&
    typeof value.fetchedAt === 'string' &&
    typeof value.stale === 'boolean';
