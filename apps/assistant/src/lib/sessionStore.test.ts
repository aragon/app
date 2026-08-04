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

    it('grants exactly one claim to concurrent executions of the same tool call', async () => {
        const store = buildStore();

        const results = await Promise.all(
            Array.from({ length: 10 }, () =>
                store.claimTicket(sessionId, 'call-1'),
            ),
        );

        expect(results.filter(Boolean)).toHaveLength(1);
        // A different tool call is unaffected — distinct calls never block each other.
        expect(await store.claimTicket(sessionId, 'call-2')).toBeTruthy();
    });

    it('replays a stored ticket and allows a retry after release', async () => {
        const store = buildStore();

        expect(await store.claimTicket(sessionId, 'call-1')).toBeTruthy();
        await store.releaseTicketClaim(sessionId, 'call-1');
        expect(await store.claimTicket(sessionId, 'call-1')).toBeTruthy();

        const ticket = {
            identifier: 'SUP-1',
            url: 'https://linear.app/aragon/issue/SUP-1',
        };
        await store.storeTicket(sessionId, 'call-1', ticket);

        // A replay of the same call reads the stored result instead of creating again.
        expect(await store.getTicket(sessionId, 'call-1')).toEqual(ticket);
        expect(await store.claimTicket(sessionId, 'call-1')).toBeFalsy();
    });

    it('hands out distinct ticket-slot reservations under concurrency', async () => {
        const store = buildStore();

        // Each concurrent reservation observes a distinct count — the property the session cap
        // is enforced on; a release frees the slot again.
        const reservations = await Promise.all(
            Array.from({ length: 5 }, () => store.reserveTicketSlot(sessionId)),
        );

        expect([...reservations].sort()).toEqual([1, 2, 3, 4, 5]);
        expect(await store.getTicketCount(sessionId)).toEqual(5);

        await store.releaseTicketSlot(sessionId);
        expect(await store.getTicketCount(sessionId)).toEqual(4);
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
