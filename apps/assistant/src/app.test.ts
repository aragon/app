import { createApp } from './app';

describe('app', () => {
    // The environment resolves from ASSISTANT_ENV / VERCEL_ENV; clear them so the test does not
    // depend on the developer's shell.
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        delete process.env.ASSISTANT_ENV;
        delete process.env.VERCEL_ENV;
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
});
