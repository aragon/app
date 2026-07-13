import { asRedis, createMockRedis } from '../test/mockRedis';
import { createSessionStore } from './sessionStore';

// Race tests only: every case here guards an atomicity property that, when broken, produces a
// real incident (duplicate tickets, oversold file slots, leaked slot counters).
describe('createSessionStore', () => {
    const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';

    const buildStore = () => createSessionStore(asRedis(createMockRedis()));

    const buildFile = (id = 'file-1') => ({
        id,
        blobUrl: `https://store.public.blob.vercel-storage.com/assistant/s/${id}/shot.png`,
        filename: 'shot.png',
        contentType: 'image/png',
        size: 1,
    });

    it('grants exactly one claim to concurrent createTicket calls', async () => {
        const store = buildStore();

        const results = await Promise.all(
            Array.from({ length: 10 }, () => store.claimIssue(sessionId)),
        );

        expect(results.filter(Boolean)).toHaveLength(1);
    });

    it('allows a retry after a released claim and replays a stored issue', async () => {
        const store = buildStore();

        expect(await store.claimIssue(sessionId)).toBeTruthy();
        await store.releaseIssueClaim(sessionId);
        expect(await store.claimIssue(sessionId)).toBeTruthy();

        const issue = {
            issueId: 'issue-1',
            identifier: 'SUP-1',
            url: 'https://linear.app/aragon/issue/SUP-1',
        };
        await store.storeIssue(sessionId, issue);
        expect(await store.getIssue(sessionId)).toEqual({
            status: 'created',
            ...issue,
        });
    });

    it('grants exactly one file claim to concurrent confirms of the same file', async () => {
        const store = buildStore();

        const results = await Promise.all(
            Array.from({ length: 10 }, () =>
                store.claimFile(sessionId, 'file-1'),
            ),
        );

        expect(results.filter(Boolean)).toHaveLength(1);
        // A different file is unaffected by the claim.
        expect(await store.claimFile(sessionId, 'file-2')).toBeTruthy();
    });

    it('allows a re-claim after release and after the file was removed', async () => {
        const store = buildStore();

        expect(await store.claimFile(sessionId, 'file-1')).toBeTruthy();
        await store.releaseFileClaim(sessionId, 'file-1');
        expect(await store.claimFile(sessionId, 'file-1')).toBeTruthy();

        // removeFile drops the claim, so re-uploading the same file id works right away.
        await store.addFile(sessionId, buildFile());
        await store.removeFile(sessionId, 'file-1');
        expect(await store.claimFile(sessionId, 'file-1')).toBeTruthy();
    });

    it('returns distinct queue lengths for concurrent adds (no lost updates)', async () => {
        const store = buildStore();

        const lengths = await Promise.all(
            Array.from({ length: 7 }, (_, index) =>
                store.addFile(sessionId, buildFile(`file-${index}`)),
            ),
        );

        // The RPUSH reply is the cap primitive: every add observes its own exact length.
        expect([...new Set(lengths)].sort((a, b) => a - b)).toEqual([
            1, 2, 3, 4, 5, 6, 7,
        ]);
        expect(await store.listFiles(sessionId)).toHaveLength(7);
    });

    it('hands the file to exactly one of concurrent removals', async () => {
        const store = buildStore();
        await store.addFile(sessionId, buildFile());

        const results = await Promise.all(
            Array.from({ length: 5 }, () =>
                store.removeFile(sessionId, 'file-1'),
            ),
        );

        expect(results.filter((result) => result != null)).toHaveLength(1);
        expect(await store.listFiles(sessionId)).toEqual([]);
    });
});
