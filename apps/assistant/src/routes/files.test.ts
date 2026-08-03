import {
    assistantLimits,
    type IAssistantError,
} from '@aragon/assistant-contracts';
import { Hono } from 'hono';
import { createMockChatModel } from '../test/mockModel';
import {
    createTestDependencies,
    type ITestDependencies,
} from '../test/testDependencies';
import { buildFilesRoute } from './files';

const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';
const otherSessionId = 'a1a1a1a1-2b2b-4c3c-8d4d-5e5e5e5e5e5e';

// getStoreIdFromToken derives the store host from segment 3 of the RW token.
const testToken = 'vercel_blob_rw_TESTSTORE_secretsecretsecret';
const storeHost = 'teststore.public.blob.vercel-storage.com';

const pngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48,
    0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0x1f, 0x15, 0xc4, 0x89,
]);

const buildFileId = (index: number) =>
    `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;

const buildBlobUrl = (params?: {
    fileId?: string;
    filename?: string;
    session?: string;
    host?: string;
}) => {
    const {
        fileId = buildFileId(1),
        filename = 'screenshot.png',
        session = sessionId,
        host = storeHost,
    } = params ?? {};

    return `https://${host}/assistant/${session}/${fileId}/${filename}`;
};

const buildApp = (deps: ITestDependencies) =>
    new Hono().route('/files', buildFilesRoute(deps));

const requestToken = (app: Hono, pathname: string, payloadSessionId: string) =>
    app.request('/files/token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            type: 'blob.generate-client-token',
            payload: {
                pathname,
                callbackUrl: 'https://assistant.test/files/token',
                clientPayload: JSON.stringify({ sessionId: payloadSessionId }),
                multipart: false,
            },
        }),
    });

const confirmUpload = (
    app: Hono,
    params?: { blobUrl?: string; session?: string },
) =>
    app.request('/files/confirm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            sessionId: params?.session ?? sessionId,
            blobUrl: params?.blobUrl ?? buildBlobUrl(),
        }),
    });

// Security core of the files feature: session-pinned upload paths, store-pinned blob URLs,
// authoritative magic-byte validation at confirm time and the race-safe slot cap.
describe('files routes', () => {
    beforeEach(() => {
        process.env.BLOB_READ_WRITE_TOKEN = testToken;
    });

    afterAll(() => {
        process.env.BLOB_READ_WRITE_TOKEN = undefined;
    });

    it('rejects an upload-token pathname that does not belong to the session', async () => {
        const deps = createTestDependencies(createMockChatModel({}));

        const response = await requestToken(
            buildApp(deps),
            `assistant/${otherSessionId}/${buildFileId(1)}/screenshot.png`,
            sessionId,
        );

        expect(response.status).toEqual(400);
    });

    it('accepts uppercase-hex UUIDs in the upload path, matching z.uuid() validation', async () => {
        const upperSessionId = sessionId.toUpperCase();
        const deps = createTestDependencies(createMockChatModel({}));
        const app = buildApp(deps);

        const tokenResponse = await requestToken(
            app,
            `assistant/${upperSessionId}/${buildFileId(1)}/screenshot.png`,
            upperSessionId,
        );
        expect(tokenResponse.status).toEqual(200);

        const blobUrl = buildBlobUrl({ session: upperSessionId });
        deps.blobStore.blobs.set(blobUrl, pngBytes);
        const confirmResponse = await confirmUpload(app, {
            blobUrl,
            session: upperSessionId,
        });
        expect(confirmResponse.status).toEqual(201);
        expect(await deps.sessionStore.listFiles(upperSessionId)).toHaveLength(
            1,
        );
    });

    it('rejects confirms for blob URLs of a foreign store or a foreign session', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        const app = buildApp(deps);

        const foreignStore = await confirmUpload(app, {
            blobUrl: buildBlobUrl({ host: 'evil.example.com' }),
        });
        expect(foreignStore.status).toEqual(400);

        const foreignSession = await confirmUpload(app, {
            blobUrl: buildBlobUrl({ session: otherSessionId }),
        });
        expect(foreignSession.status).toEqual(400);

        expect(await deps.sessionStore.listFiles(sessionId)).toEqual([]);
    });

    it('rejects content that fails magic-byte validation and deletes the blob', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        const blobUrl = buildBlobUrl({ filename: 'renamed.png' });
        // MZ header: an executable renamed to .png.
        deps.blobStore.blobs.set(
            blobUrl,
            new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0]),
        );

        const response = await confirmUpload(buildApp(deps), { blobUrl });

        expect(response.status).toEqual(415);
        const body = (await response.json()) as IAssistantError;
        expect(body.error.code).toEqual('unsupported_file');
        expect(deps.blobStore.deletedUrls).toEqual([blobUrl]);
        expect(await deps.sessionStore.listFiles(sessionId)).toEqual([]);
    });

    it('is idempotent: a confirm retry returns the queued file without a new slot', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        const blobUrl = buildBlobUrl();
        deps.blobStore.blobs.set(blobUrl, pngBytes);
        const app = buildApp(deps);

        const first = await confirmUpload(app, { blobUrl });
        expect(first.status).toEqual(201);

        const retry = await confirmUpload(app, { blobUrl });
        expect(retry.status).toEqual(200);
        expect(await deps.sessionStore.listFiles(sessionId)).toHaveLength(1);
    });

    it('queues a re-upload of identical bytes as its own removable entry', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        const app = buildApp(deps);

        const firstBlobUrl = buildBlobUrl();
        deps.blobStore.blobs.set(firstBlobUrl, pngBytes);
        const first = await confirmUpload(app, { blobUrl: firstBlobUrl });
        expect(first.status).toEqual(201);

        // The same bytes under a fresh file id: the user re-attached the same screenshot. It
        // queues independently — the dedup happens at transfer time — so each composer tile
        // owns its own entry and blob.
        const duplicateBlobUrl = buildBlobUrl({ fileId: buildFileId(2) });
        deps.blobStore.blobs.set(duplicateBlobUrl, pngBytes);
        const duplicate = await confirmUpload(app, {
            blobUrl: duplicateBlobUrl,
        });
        expect(duplicate.status).toEqual(201);
        expect(await deps.sessionStore.listFiles(sessionId)).toHaveLength(2);

        // Removing the re-upload never touches the original entry or its blob.
        const remove = await app.request(`/files/${buildFileId(2)}`, {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });
        expect(remove.status).toEqual(204);
        const remaining = await deps.sessionStore.listFiles(sessionId);
        expect(remaining).toHaveLength(1);
        expect(remaining[0]?.id).toEqual(buildFileId(1));
        expect(deps.blobStore.deletedUrls).toEqual([duplicateBlobUrl]);
    });

    it('queues the file exactly once under concurrent confirms of the same blob', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        const blobUrl = buildBlobUrl();
        deps.blobStore.blobs.set(blobUrl, pngBytes);
        const app = buildApp(deps);

        const responses = await Promise.all(
            Array.from({ length: 5 }, () => confirmUpload(app, { blobUrl })),
        );

        // Exactly one confirm wins the claim and queues the file; the losers replay the queued
        // file (200) or report the in-flight confirm (400) — never a second queue entry.
        const statuses = responses.map((response) => response.status);
        expect(statuses.filter((status) => status === 201)).toHaveLength(1);
        expect(
            statuses.every((status) => [200, 201, 400].includes(status)),
        ).toBeTruthy();
        expect(await deps.sessionStore.listFiles(sessionId)).toHaveLength(1);
    });

    it('allows a fresh confirm retry after a failed one released the claim', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        const blobUrl = buildBlobUrl();
        const app = buildApp(deps);

        // First confirm fails: the blob does not exist yet (missing upload).
        const failed = await confirmUpload(app, { blobUrl });
        expect(failed.status).toEqual(400);

        // The claim was released, so the retry succeeds once the blob is there.
        deps.blobStore.blobs.set(blobUrl, pngBytes);
        const retried = await confirmUpload(app, { blobUrl });
        expect(retried.status).toEqual(201);
        expect(await deps.sessionStore.listFiles(sessionId)).toHaveLength(1);
    });

    it('never exceeds the file cap under concurrent confirms', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        const app = buildApp(deps);

        const blobUrls = Array.from(
            { length: assistantLimits.maxFilesPerSession + 2 },
            (_, index) =>
                buildBlobUrl({
                    fileId: buildFileId(index),
                    filename: `file-${index}.png`,
                }),
        );
        for (const blobUrl of blobUrls) {
            deps.blobStore.blobs.set(blobUrl, pngBytes);
        }

        const responses = await Promise.all(
            blobUrls.map((blobUrl) => confirmUpload(app, { blobUrl })),
        );

        const statuses = responses.map((response) => response.status);
        expect(statuses.filter((status) => status === 201)).toHaveLength(
            assistantLimits.maxFilesPerSession,
        );
        expect(statuses.filter((status) => status === 429)).toHaveLength(2);
        expect(await deps.sessionStore.listFiles(sessionId)).toHaveLength(
            assistantLimits.maxFilesPerSession,
        );
    });

    it('removes a queued file on DELETE, deletes its blob and frees the slot', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        const app = buildApp(deps);
        const blobUrl = buildBlobUrl();
        deps.blobStore.blobs.set(blobUrl, pngBytes);
        await confirmUpload(app, { blobUrl });

        const response = await app.request(`/files/${buildFileId(1)}`, {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });

        expect(response.status).toEqual(204);
        expect(await deps.sessionStore.listFiles(sessionId)).toEqual([]);
        expect(deps.blobStore.deletedUrls).toEqual([blobUrl]);
    });
});
