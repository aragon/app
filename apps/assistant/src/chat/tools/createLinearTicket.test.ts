import {
    assistantLimits,
    type IChatMessage,
    type ICreateTicketToolInput,
} from '@aragon/assistant-contracts';
import { createMockChatModel } from '../../test/mockModel';
import {
    createTestDependencies,
    type ITestDependencies,
} from '../../test/testDependencies';
import { createSessionTicket } from './createLinearTicket';

const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';

const input: ICreateTicketToolInput = {
    intent: 'bug',
    title: 'Voting transaction reverts',
    description: 'Submitting a vote on a proposal reverts with an error.',
};

const messages: IChatMessage[] = [
    { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'vote reverts' }] },
];

// The execute path only ever runs after the user approved the draft; these cases guard the
// incident surfaces of that run: the session cap, replay idempotency and claim release on failure.
describe('createSessionTicket', () => {
    const run = (deps: ITestDependencies, toolCallId: string) =>
        createSessionTicket(
            {
                deps,
                sessionId,
                appContext: { route: '/dao', appVersion: '1.0.0' },
                messages,
            },
            input,
            toolCallId,
        );

    it('creates the ticket, returns its reference and counts it', async () => {
        const deps = createTestDependencies(createMockChatModel({}));

        const result = await run(deps, 'call-1');

        expect(result).toEqual({
            identifier: 'SUP-1',
            url: 'https://linear.app/aragon/issue/SUP-1',
        });
        expect(deps.linear.createIssueCalls).toHaveLength(1);
        expect(deps.linear.createIssueCalls[0]?.labelName).toEqual('bug');
        expect(await deps.sessionStore.getTicketCount(sessionId)).toEqual(1);
    });

    it('replays the same ticket on a repeated tool call (idempotent)', async () => {
        const deps = createTestDependencies(createMockChatModel({}));

        const first = await run(deps, 'call-1');
        const second = await run(deps, 'call-1');

        expect(second).toEqual(first);
        // The second execution short-circuits on the claim: no duplicate Linear issue.
        expect(deps.linear.createIssueCalls).toHaveLength(1);
        expect(await deps.sessionStore.getTicketCount(sessionId)).toEqual(1);
    });

    it('refuses once the session ticket cap is reached', async () => {
        const deps = createTestDependencies(createMockChatModel({}));

        for (let i = 0; i < assistantLimits.maxIssuesPerSession; i += 1) {
            await run(deps, `call-${i}`);
        }

        await expect(run(deps, 'call-over')).rejects.toThrow(/ticket limit/i);
        expect(deps.linear.createIssueCalls).toHaveLength(
            assistantLimits.maxIssuesPerSession,
        );
    });

    it('never exceeds the ticket cap under concurrent calls of distinct tool calls', async () => {
        const deps = createTestDependencies(createMockChatModel({}));

        // Distinct tool call ids race for the session slots: a read-check-then-increment cap
        // would let every one of them pass while the counter still reads below the limit.
        const results = await Promise.allSettled(
            Array.from({ length: 5 }, (_, index) => run(deps, `call-${index}`)),
        );

        const created = results.filter(
            (result) => result.status === 'fulfilled',
        );
        expect(created).toHaveLength(assistantLimits.maxIssuesPerSession);
        expect(deps.linear.createIssueCalls).toHaveLength(
            assistantLimits.maxIssuesPerSession,
        );
        expect(await deps.sessionStore.getTicketCount(sessionId)).toEqual(
            assistantLimits.maxIssuesPerSession,
        );
    });

    it('releases the claim on a Linear failure so a retry of the same call succeeds', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        deps.linear.failNextCreate = true;

        await expect(run(deps, 'call-1')).rejects.toThrow(/failed/i);
        // The claim was released: the very same tool call can create on retry.
        const retried = await run(deps, 'call-1');
        expect(retried.identifier).toEqual('SUP-1');
        expect(await deps.sessionStore.getTicketCount(sessionId)).toEqual(1);
    });

    it('transfers queued files to Linear and clears them after creation', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        // Signature + IHDR chunk of a valid PNG (magic-byte validation runs again here).
        const pngBytes = new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49,
            0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0x1f, 0x15,
            0xc4, 0x89,
        ]);
        const blobUrl = `https://store.public.blob.vercel-storage.com/assistant/${sessionId}/file-1/shot.png`;
        deps.blobStore.blobs.set(blobUrl, pngBytes);
        await deps.sessionStore.addFile(sessionId, {
            id: 'file-1',
            blobUrl,
            filename: 'shot.png',
            contentType: 'image/png',
            size: pngBytes.length,
        });

        await run(deps, 'call-1');

        expect(deps.linear.uploadFileCalls).toHaveLength(1);
        expect(await deps.sessionStore.listFiles(sessionId)).toEqual([]);
        expect(deps.blobStore.deletedUrls).toContain(blobUrl);
    });

    it('transfers queued entries carrying the same bytes once and cleans up both', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        const pngBytes = new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49,
            0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0x1f, 0x15,
            0xc4, 0x89,
        ]);
        // The same screenshot attached twice: two independent queue entries (own id and blob)
        // sharing one content hash — confirm no longer deduplicates, the transfer does.
        const contentHash = 'a'.repeat(64);
        const buildBlobUrl = (fileId: string) =>
            `https://store.public.blob.vercel-storage.com/assistant/${sessionId}/${fileId}/shot.png`;
        for (const fileId of ['file-1', 'file-2']) {
            const blobUrl = buildBlobUrl(fileId);
            deps.blobStore.blobs.set(blobUrl, pngBytes);
            await deps.sessionStore.addFile(sessionId, {
                id: fileId,
                blobUrl,
                filename: 'shot.png',
                contentType: 'image/png',
                size: pngBytes.length,
                contentHash,
            });
        }

        await run(deps, 'call-1');

        // The ticket carries the content once, yet both entries and blobs are cleaned up.
        expect(deps.linear.uploadFileCalls).toHaveLength(1);
        expect(await deps.sessionStore.listFiles(sessionId)).toEqual([]);
        expect(deps.blobStore.deletedUrls).toEqual(
            expect.arrayContaining([
                buildBlobUrl('file-1'),
                buildBlobUrl('file-2'),
            ]),
        );
    });
});
