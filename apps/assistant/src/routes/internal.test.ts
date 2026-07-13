import { Hono } from 'hono';
import { createMockChatModel } from '../test/mockModel';
import { createTestDependencies } from '../test/testDependencies';
import { buildInternalRoute } from './internal';

const cronSecret = 'test-cron-secret';

const buildApp = () =>
    new Hono().route(
        '/internal',
        buildInternalRoute(createTestDependencies(createMockChatModel({}))),
    );

const getCleanup = (app: Hono, authorization?: string) =>
    app.request('/internal/cleanup', {
        headers: authorization == null ? {} : { authorization },
    });

// The cron auth guard must fail closed: /internal/cleanup deletes session blobs, so an
// unauthenticated or unconfigured deployment must never serve it.
describe('internal routes auth', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        process.env.CRON_SECRET = cronSecret;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('rejects every request when no CRON_SECRET is configured', async () => {
        delete process.env.CRON_SECRET;

        const response = await getCleanup(buildApp(), 'Bearer undefined');

        expect(response.status).toEqual(401);
    });

    it('rejects missing and wrong bearer tokens', async () => {
        const app = buildApp();

        expect((await getCleanup(app)).status).toEqual(401);
        expect((await getCleanup(app, 'Bearer wrong')).status).toEqual(401);
    });

    it('serves the cleanup sweep for the configured secret', async () => {
        const response = await getCleanup(buildApp(), `Bearer ${cronSecret}`);

        expect(response.status).toEqual(200);
        await expect(response.json()).resolves.toEqual({ deleted: 0 });
    });
});
