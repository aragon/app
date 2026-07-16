import { createApp } from './index';
import { observability } from './lib/observability';
import { createMockChatModel } from './test/mockModel';
import { createTestDependencies } from './test/testDependencies';

describe('app', () => {
    // The environment resolves from ASSISTANT_ENV / VERCEL_ENV; clear them so the tests do not
    // depend on the developer's shell.
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        delete process.env.ASSISTANT_ENV;
        delete process.env.VERCEL_ENV;
        delete process.env.ASSISTANT_RATE_LIMIT_RPM;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('responds to /health with ok status and environment', async () => {
        const response = await createApp().request('/health');

        expect(response.status).toEqual(200);
        await expect(response.json()).resolves.toEqual({
            status: 'ok',
            environment: 'local',
        });
    });

    it('returns 404 for unknown routes', async () => {
        const response = await createApp().request('/unknown');

        expect(response.status).toEqual(404);
    });

    it('constructs without secrets: default dependencies are lazy', () => {
        expect(() => createApp()).not.toThrow();
    });

    it('maps unhandled route errors to the shared error shape', async () => {
        const deps = createTestDependencies(createMockChatModel({}));
        deps.getSessionStore = () => {
            throw new Error('dependency construction failed');
        };
        const app = createApp(deps);

        const response = await app.request('/chat', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f',
                messages: [
                    {
                        id: 'message-1',
                        role: 'user',
                        parts: [{ type: 'text', text: 'Hello' }],
                    },
                ],
                appContext: { route: '/dao', appVersion: '1.33.2' },
            }),
        });

        expect(response.status).toEqual(500);
        await expect(response.json()).resolves.toEqual({
            error: { code: 'internal', message: 'Internal server error.' },
        });
    });

    // The widget maps this exact shape to its retry UX: the shape and the Retry-After header are
    // part of the wire contract.
    it('rejects requests over the per-minute limit with the shared 429 shape', async () => {
        process.env.ASSISTANT_RATE_LIMIT_RPM = '1';
        const deps = createTestDependencies(createMockChatModel({}));
        const app = createApp(deps);

        const first = await app.request('/issues', { method: 'POST' });
        expect(first.status).toEqual(400);

        const second = await app.request('/issues', { method: 'POST' });
        expect(second.status).toEqual(429);
        expect(second.headers.get('Retry-After')).not.toBeNull();
        await expect(second.json()).resolves.toEqual({
            error: {
                code: 'rate_limited',
                message: 'Too many requests, please retry later.',
            },
        });
    });

    it('logs the rate-limit refusal with the sessionId peeked from the request body', async () => {
        process.env.ASSISTANT_RATE_LIMIT_RPM = '1';
        const logStepSpy = jest
            .spyOn(observability, 'logStep')
            .mockImplementation(jest.fn());
        const deps = createTestDependencies(createMockChatModel({}));
        const app = createApp(deps);
        const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';
        const postIssues = () =>
            app.request('/issues', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ sessionId, messages: [] }),
            });

        await postIssues();
        const refused = await postIssues();

        expect(refused.status).toEqual(429);
        expect(logStepSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                sessionId,
                step: 'rateLimit',
                refusalReason: 'rate_limited',
            }),
        );
        logStepSpy.mockRestore();
    });

    describe('cors', () => {
        const getAllowedOrigin = async (
            origin: string,
            environment?: string,
        ) => {
            if (environment != null) {
                process.env.ASSISTANT_ENV = environment;
            }
            const response = await createApp().request('/health', {
                headers: { origin },
            });

            return response.headers.get('access-control-allow-origin');
        };

        it('allows the app origins everywhere', async () => {
            expect(await getAllowedOrigin('https://app.aragon.org')).toEqual(
                'https://app.aragon.org',
            );
            // *.app.aragon.org matches nested subdomains of our own zone.
            expect(
                await getAllowedOrigin(
                    'https://dev.app.aragon.org',
                    'production',
                ),
            ).toEqual('https://dev.app.aragon.org');
        });

        it('allows the localhost dev origin outside production despite being http', async () => {
            // Exact-listed origins bypass the https gate, which only applies to wildcard
            // suffix patterns.
            const localhostOrigin = 'http://localhost:3000';

            expect(await getAllowedOrigin(localhostOrigin)).toEqual(
                localhostOrigin,
            );
            expect(
                await getAllowedOrigin(localhostOrigin, 'production'),
            ).toBeNull();
        });

        it('allows team-scope Vercel previews outside production only', async () => {
            const previewOrigin = 'https://feature-x-aragon-app.vercel.app';

            expect(await getAllowedOrigin(previewOrigin)).toEqual(
                previewOrigin,
            );
            expect(
                await getAllowedOrigin(previewOrigin, 'production'),
            ).toBeNull();
        });

        it('rejects foreign, lookalike and non-https origins', async () => {
            const rejected = [
                'https://evil.example.com',
                // The suffix must terminate the hostname.
                'https://x-aragon-app.vercel.app.evil.com',
                // *-suffix patterns must not span DNS labels.
                'https://foo.bar-aragon-app.vercel.app',
                'http://app.aragon.org',
            ];

            for (const origin of rejected) {
                expect(await getAllowedOrigin(origin)).toBeNull();
            }
        });
    });
});
