import type {
    IAssistantError,
    ICreateIssueResponse,
    IPreviewIssueResponse,
} from '@aragon/assistant-contracts';
import { Hono } from 'hono';
import { createMockChatModel } from '../test/mockModel';
import {
    createTestDependencies,
    type ITestDependencies,
} from '../test/testDependencies';
import { buildIssuesRoute } from './issues';

const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';

const pngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48,
    0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0x1f, 0x15, 0xc4, 0x89,
]);

// The preview runs classify + extract; each mocked result is a single object valid for BOTH
// schemas: classification reads `intent`, extraction strips it and reads the field values (the
// extraction schema is required-but-nullable, so every field key must be present).
const buildModel = (previews: number) =>
    createMockChatModel({
        objects: Array.from({ length: previews * 2 }, () => ({
            intent: 'bug',
            email: 'user@example.com',
            summary: 'Voting crash',
            description: 'The vote button crashes.',
            stepsToReproduce: null,
        })),
    });

// Creation never calls the model: it consumes the snapshot the preview stored. Tests exercising
// creation seed the snapshot directly and hand the route a model that would fail loudly.
const storeSnapshot = (deps: ITestDependencies) =>
    deps.sessionStore.storeCollectedFields(sessionId, {
        intent: 'bug',
        summary: 'Voting crash',
        description: 'The vote button crashes.',
    });

const buildRequestBody = () => ({
    sessionId,
    messages: [
        {
            id: 'message-1',
            role: 'user',
            parts: [{ type: 'text', text: 'It crashes.' }],
        },
    ],
    appContext: { route: '/dao', appVersion: '1.33.2' },
});

const buildApp = (deps: ITestDependencies) =>
    new Hono().route('/issues', buildIssuesRoute(deps));

const post = (app: Hono, path: string) =>
    app.request(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(buildRequestBody()),
    });

const postPreview = (app: Hono) => post(app, '/issues/preview');
const postIssue = (app: Hono) => post(app, '/issues');

describe('POST /issues/preview', () => {
    it('distills the transcript, stores the snapshot and returns the reviewable summary', async () => {
        const deps = createTestDependencies(buildModel(1));

        const response = await postPreview(buildApp(deps));

        expect(response.status).toEqual(200);
        const body = (await response.json()) as IPreviewIssueResponse;
        expect(body).toEqual({
            status: 'ready',
            summary: 'Voting crash',
            intent: 'bug',
        });
        // POST /issues creates from exactly this state — what was reviewed is what is sent.
        expect(
            await deps.sessionStore.getCollectedFields(sessionId),
        ).toMatchObject({ summary: 'Voting crash' });
    });

    it('answers unclear without storing a snapshot when required fields are missing', async () => {
        const model = createMockChatModel({
            objects: [
                { intent: 'bug' },
                {
                    email: 'user@example.com',
                    summary: null,
                    description: null,
                    stepsToReproduce: null,
                },
            ],
        });
        const deps = createTestDependencies(model);

        const response = await postPreview(buildApp(deps));

        expect(response.status).toEqual(200);
        const body = (await response.json()) as IPreviewIssueResponse;
        expect(body).toEqual({ status: 'unclear' });
        expect(
            await deps.sessionStore.getCollectedFields(sessionId),
        ).toBeNull();
    });

    it('tolerates null extraction fields instead of failing', async () => {
        const model = createMockChatModel({
            // Models regularly emit null for absent fields; the extraction schema must
            // normalize them, not throw NoObjectGeneratedError.
            objects: [
                { intent: 'bug' },
                {
                    summary: 'Voting crash',
                    description: 'It crashes.',
                    email: null,
                    stepsToReproduce: null,
                },
            ],
        });
        const deps = createTestDependencies(model);

        const response = await postPreview(buildApp(deps));

        expect(response.status).toEqual(200);
        const body = (await response.json()) as IPreviewIssueResponse;
        expect(body.status).toEqual('ready');
    });

    it('retries the extraction once when the model output does not match the schema', async () => {
        const model = createMockChatModel({
            objects: [
                { intent: 'bug' },
                // First extraction attempt: steps as a string — rejected by the schema.
                {
                    email: null,
                    summary: 'Voting crash',
                    description: 'It crashes.',
                    stepsToReproduce: '1. Vote 2. Crash',
                },
                {
                    email: null,
                    summary: 'Voting crash',
                    description: 'It crashes.',
                    stepsToReproduce: ['Vote', 'Observe the crash'],
                },
            ],
        });
        const deps = createTestDependencies(model);

        const response = await postPreview(buildApp(deps));

        expect(response.status).toEqual(200);
        const body = (await response.json()) as IPreviewIssueResponse;
        expect(body.status).toEqual('ready');
        expect(
            await deps.sessionStore.getCollectedFields(sessionId),
        ).toMatchObject({ stepsToReproduce: ['Vote', 'Observe the crash'] });
    });

    it('answers a structured retryable error instead of an unhandled 500 when the model fails', async () => {
        // No mocked results at all: the classify call itself throws (upstream failure).
        const deps = createTestDependencies(
            createMockChatModel({ objects: [] }),
        );

        const response = await postPreview(buildApp(deps));

        expect(response.status).toEqual(502);
        const body = (await response.json()) as IAssistantError;
        expect(body.error.code).toEqual('internal');
    });

    it('refuses to preview a session that already created its issue', async () => {
        const deps = createTestDependencies(buildModel(0));
        await storeSnapshot(deps);
        await postIssue(buildApp(deps));

        const response = await postPreview(buildApp(deps));

        expect(response.status).toEqual(409);
        const body = (await response.json()) as IAssistantError;
        expect(body.error.code).toEqual('issue_already_created');
    });
});

// Duplicate-ticket protection: every case here failing means duplicated Linear issues or a
// session bricked after a transient failure.
describe('POST /issues', () => {
    it('refuses creation without a reviewed preview snapshot', async () => {
        const deps = createTestDependencies(buildModel(0));

        const response = await postIssue(buildApp(deps));

        expect(response.status).toEqual(422);
        const body = (await response.json()) as IAssistantError;
        expect(body.error.code).toEqual('preview_required');
        expect(deps.linear.createIssueCalls).toHaveLength(0);
    });

    it('creates the ticket from the stored snapshot without any model call', async () => {
        // A model call would fail loudly: no mocked results are provided.
        const deps = createTestDependencies(buildModel(0));
        await storeSnapshot(deps);

        const response = await postIssue(buildApp(deps));

        expect(response.status).toEqual(201);
        expect(deps.linear.createIssueCalls[0]?.title).toContain(
            'Voting crash',
        );
    });

    it('replays the stored issue on retries instead of creating a second one', async () => {
        const deps = createTestDependencies(buildModel(0));
        await storeSnapshot(deps);
        const app = buildApp(deps);

        const first = await postIssue(app);
        expect(first.status).toEqual(201);

        const second = await postIssue(app);
        expect(second.status).toEqual(200);
        const body = (await second.json()) as ICreateIssueResponse;
        expect(body.alreadyExisted).toBeTruthy();
        expect(deps.linear.createIssueCalls).toHaveLength(1);
    });

    it('creates exactly one issue for concurrent submits', async () => {
        const deps = createTestDependencies(buildModel(0));
        await storeSnapshot(deps);
        const app = buildApp(deps);

        const responses = await Promise.all(
            Array.from({ length: 5 }, () => postIssue(app)),
        );

        expect(deps.linear.createIssueCalls).toHaveLength(1);
        const statuses = responses.map((response) => response.status).sort();
        // One 201; the rest replay (200) or observe the in-flight claim (409).
        expect(statuses.filter((status) => status === 201)).toHaveLength(1);
        for (const status of statuses) {
            expect([200, 201, 409]).toContain(status);
        }
    });

    it('releases the claim on Linear failure so a retry succeeds', async () => {
        const deps = createTestDependencies(buildModel(0));
        await storeSnapshot(deps);
        deps.linear.failNextCreate = true;
        const app = buildApp(deps);

        const failed = await postIssue(app);
        expect(failed.status).toEqual(502);
        const failedBody = (await failed.json()) as IAssistantError;
        expect(failedBody.error.code).toEqual('internal');

        const retried = await postIssue(app);
        expect(retried.status).toEqual(201);
        expect(deps.linear.createIssueCalls).toHaveLength(1);
    });

    it('transfers queued blobs to Linear at creation time and cleans them up', async () => {
        const deps = createTestDependencies(buildModel(0));
        await storeSnapshot(deps);
        const blobUrl = `https://store.public.blob.vercel-storage.com/assistant/${sessionId}/file-1/shot.png`;
        deps.blobStore.blobs.set(blobUrl, pngBytes);
        await deps.sessionStore.addFile(sessionId, {
            id: 'file-1',
            blobUrl,
            filename: 'shot.png',
            contentType: 'image/png',
            size: pngBytes.byteLength,
        });

        const response = await postIssue(buildApp(deps));

        expect(response.status).toEqual(201);
        // The bytes moved blob -> Linear only now, at creation time.
        expect(deps.linear.uploadFileCalls).toEqual([
            { filename: 'shot.png', contentType: 'image/png' },
        ]);
        expect(deps.linear.createIssueCalls[0]?.description).toContain(
            'https://uploads.linear.app/shot.png',
        );
        // The blob and the queue are gone once the ticket exists.
        expect(deps.blobStore.deletedUrls).toEqual([blobUrl]);
        expect(await deps.sessionStore.listFiles(sessionId)).toEqual([]);
    });

    it('drops a queued file failing re-validation instead of blocking creation', async () => {
        const deps = createTestDependencies(buildModel(0));
        await storeSnapshot(deps);
        const blobUrl = `https://store.public.blob.vercel-storage.com/assistant/${sessionId}/file-1/renamed.png`;
        // MZ header: an executable that somehow ended up in the queue.
        deps.blobStore.blobs.set(
            blobUrl,
            new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0]),
        );
        await deps.sessionStore.addFile(sessionId, {
            id: 'file-1',
            blobUrl,
            filename: 'renamed.png',
            contentType: 'image/png',
            size: 8,
        });

        const response = await postIssue(buildApp(deps));

        expect(response.status).toEqual(201);
        expect(deps.linear.uploadFileCalls).toEqual([]);
        expect(deps.linear.createIssueCalls[0]?.description).not.toContain(
            'renamed.png',
        );
    });
});
