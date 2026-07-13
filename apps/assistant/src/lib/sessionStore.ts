import type { ICollectedFields } from '@aragon/assistant-contracts';
import type { Redis } from '@upstash/redis';

// Session state lives 24 hours — the lifecycle of a single support request.
export const sessionTtlSeconds = 24 * 60 * 60;

// Claims guard a single in-flight operation and self-heal after a crash that never released
// them. The TTL must outlive any in-flight execution, or a concurrent request could re-claim
// while the first one is still running (duplicate issue / duplicate file): Vercel functions can
// run up to 800s, so 15 minutes keeps a safety margin above the hard platform ceiling.
const claimTtlSeconds = 15 * 60;

const buildKey = (
    sessionId: string,
    part: 'issue' | 'files' | 'turns' | 'tokens' | 'extraction',
) => `assistant:${sessionId}:${part}`;

const buildFileClaimKey = (sessionId: string, fileId: string) =>
    `assistant:${sessionId}:fileclaim:${fileId}`;

// A file queued for the ticket: the bytes live in blob storage (blobUrl) and reach Linear only
// when the issue is created; until then the queue can be freely added to and removed from.
export interface ISessionFile {
    id: string;
    blobUrl: string;
    filename: string;
    contentType: string;
    size: number;
}

export type ISessionIssue =
    | { status: 'creating' }
    | { status: 'created'; issueId: string; identifier: string; url: string };

export interface ISessionStore {
    // --- Turn and token budgets ---
    getTurns(sessionId: string): Promise<number>;
    incrementTurns(sessionId: string): Promise<number>;
    // Refunds a turn after an upstream failure: the user got no reply, so the retry must not
    // count double against the turn budget.
    decrementTurns(sessionId: string): Promise<number>;
    addTokens(sessionId: string, count: number): Promise<number>;
    getTokens(sessionId: string): Promise<number>;

    // --- Collected ticket fields ---
    // The accumulated extraction state of the session: /chat merges each successful extraction
    // into it, /issues creates the ticket from it — the "Ready to send" strip and the created
    // ticket always read the same state. The values are user-derived ticket content (same data
    // that ends up in Linear), held under the session TTL like the queued file metadata.
    storeCollectedFields(
        sessionId: string,
        fields: ICollectedFields,
    ): Promise<void>;
    getCollectedFields(sessionId: string): Promise<ICollectedFields | null>;

    // --- Issue lifecycle ---
    // Atomically claims the single issue slot of the session; false when already claimed. The
    // claim expires on its own, so a crashed creation cannot brick the session.
    claimIssue(sessionId: string): Promise<boolean>;
    // Releases the claim after a failed creation so a retry can succeed.
    releaseIssueClaim(sessionId: string): Promise<void>;
    storeIssue(
        sessionId: string,
        issue: { issueId: string; identifier: string; url: string },
    ): Promise<void>;
    getIssue(sessionId: string): Promise<ISessionIssue | null>;

    // --- File queue ---
    listFiles(sessionId: string): Promise<ISessionFile[]>;
    getFile(sessionId: string, fileId: string): Promise<ISessionFile | null>;
    // Atomically claims the confirm of a single file; false when its confirm is in flight.
    // Closes the duplicate-confirm race: the same blob cannot be queued twice.
    claimFile(sessionId: string, fileId: string): Promise<boolean>;
    // Releases the claim after a failed confirm so a retry of the same file can succeed.
    releaseFileClaim(sessionId: string, fileId: string): Promise<void>;
    // Appends the file and returns the resulting queue length. The length is the atomic reply
    // of a single RPUSH, so the caller enforces the per-session cap exactly: on an over-cap
    // result it removes its own entry (removeFile) — concurrent adds cannot oversubscribe.
    addFile(sessionId: string, file: ISessionFile): Promise<number>;
    // Removes the file and its claim; returns the removed file (the caller deletes the blob)
    // or null when the id is unknown. Of two concurrent removals only one gets the file.
    removeFile(sessionId: string, fileId: string): Promise<ISessionFile | null>;
    // Drops the whole file queue, after the files moved into the ticket.
    clearFiles(sessionId: string): Promise<void>;
}

// Expects a client with automatic deserialization DISABLED: every stored value below is an
// explicit JSON string, and removeFile relies on LREM matching the byte-exact serialized entry.
export const createSessionStore = (redis: Redis): ISessionStore => {
    // INCRBY creates counter keys without a TTL; EXPIRE NX applies the expiry only when the key
    // has none yet, so it is never extended by later activity.
    const incrementBy = async (key: string, amount: number) => {
        const value = await redis.incrby(key, amount);
        await redis.expire(key, sessionTtlSeconds, 'NX');

        return value;
    };

    // The byte-exact stored entry — LREM in removeFile matches on it.
    const findSerializedFile = async (sessionId: string, fileId: string) => {
        const values = await redis.lrange<string>(
            buildKey(sessionId, 'files'),
            0,
            -1,
        );

        return (
            values.find(
                (value) => (JSON.parse(value) as ISessionFile).id === fileId,
            ) ?? null
        );
    };

    return {
        getTurns: async (sessionId) =>
            Number(
                (await redis.get<string>(buildKey(sessionId, 'turns'))) ?? 0,
            ),
        incrementTurns: (sessionId) =>
            incrementBy(buildKey(sessionId, 'turns'), 1),
        decrementTurns: (sessionId) =>
            incrementBy(buildKey(sessionId, 'turns'), -1),
        addTokens: (sessionId, count) =>
            incrementBy(buildKey(sessionId, 'tokens'), count),
        getTokens: async (sessionId) =>
            Number(
                (await redis.get<string>(buildKey(sessionId, 'tokens'))) ?? 0,
            ),
        storeCollectedFields: async (sessionId, fields) => {
            await redis.set(
                buildKey(sessionId, 'extraction'),
                JSON.stringify(fields),
                { ex: sessionTtlSeconds },
            );
        },
        getCollectedFields: async (sessionId) => {
            const value = await redis.get<string>(
                buildKey(sessionId, 'extraction'),
            );

            return value == null
                ? null
                : (JSON.parse(value) as ICollectedFields);
        },
        // SET NX EX: exactly one concurrent createTicket call observes 'OK'. The short TTL only
        // covers the in-flight creation; storeIssue overwrites it with the session TTL.
        claimIssue: async (sessionId) => {
            const result = await redis.set(
                buildKey(sessionId, 'issue'),
                JSON.stringify({ status: 'creating' }),
                { ex: claimTtlSeconds, nx: true },
            );

            return result === 'OK';
        },
        releaseIssueClaim: async (sessionId) => {
            await redis.del(buildKey(sessionId, 'issue'));
        },
        storeIssue: async (sessionId, issue) => {
            await redis.set(
                buildKey(sessionId, 'issue'),
                JSON.stringify({ status: 'created', ...issue }),
                { ex: sessionTtlSeconds },
            );
        },
        getIssue: async (sessionId) => {
            const value = await redis.get<string>(buildKey(sessionId, 'issue'));

            return value == null ? null : (JSON.parse(value) as ISessionIssue);
        },
        listFiles: async (sessionId) => {
            const values = await redis.lrange<string>(
                buildKey(sessionId, 'files'),
                0,
                -1,
            );

            return values.map((value) => JSON.parse(value) as ISessionFile);
        },
        getFile: async (sessionId, fileId) => {
            const serialized = await findSerializedFile(sessionId, fileId);

            return serialized == null
                ? null
                : (JSON.parse(serialized) as ISessionFile);
        },
        // SET NX EX: exactly one concurrent confirm of the same file observes 'OK'.
        claimFile: async (sessionId, fileId) => {
            const result = await redis.set(
                buildFileClaimKey(sessionId, fileId),
                '1',
                { ex: claimTtlSeconds, nx: true },
            );

            return result === 'OK';
        },
        releaseFileClaim: async (sessionId, fileId) => {
            await redis.del(buildFileClaimKey(sessionId, fileId));
        },
        // RPUSH keeps concurrent adds lossless and returns the exact resulting length.
        addFile: async (sessionId, file) => {
            const key = buildKey(sessionId, 'files');
            const length = await redis.rpush(key, JSON.stringify(file));
            await redis.expire(key, sessionTtlSeconds, 'NX');

            return length;
        },
        removeFile: async (sessionId, fileId) => {
            const serialized = await findSerializedFile(sessionId, fileId);

            if (serialized == null) {
                return null;
            }

            // LREM by the byte-exact serialized value: of two concurrent removals of the same
            // file only one observes removedCount === 1.
            const removedCount = await redis.lrem(
                buildKey(sessionId, 'files'),
                1,
                serialized,
            );
            if (removedCount === 0) {
                return null;
            }

            // Drop any leftover claim so a fresh confirm of the same file id works right away.
            await redis.del(buildFileClaimKey(sessionId, fileId));

            return JSON.parse(serialized) as ISessionFile;
        },
        clearFiles: async (sessionId) => {
            await redis.del(buildKey(sessionId, 'files'));
        },
    };
};
