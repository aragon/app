import './instrument';
import type { IAssistantError } from '@aragon/assistant-contracts';
import { sentry } from '@sentry/hono/node';
import { Redis } from '@upstash/redis';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getChatModel } from './chat/models';
import { createVercelBlobStore } from './files/blobStore';
import { type IAppDependencies, lazy } from './lib/appDependencies';
import { getConfig } from './lib/config';
import { resolveCorsOrigin } from './lib/cors';
import { buildRateLimitMiddleware } from './lib/rateLimit';
import { createSessionStore } from './lib/sessionStore';
import { createLinearGateway } from './linear/linearGateway';
import { buildChatRoute } from './routes/chat';
import { buildFilesRoute } from './routes/files';
import { healthRoute } from './routes/health';
import { buildInternalRoute } from './routes/internal';
import { buildIssuesRoute } from './routes/issues';

// Real dependencies are constructed lazily on first use: Upstash/Linear/Blob clients read env
// vars at construction time, and /health must work in environments without any secrets. Session
// values are explicit JSON strings (see sessionStore), so deserialization stays off and reads
// return them byte-exact.
const buildDefaultDependencies = (): IAppDependencies => {
    const getRedis = lazy(() =>
        Redis.fromEnv({ automaticDeserialization: false }),
    );

    return {
        getRedis,
        getSessionStore: lazy(() => createSessionStore(getRedis())),
        getLinear: lazy(() => createLinearGateway()),
        getChatModel,
        getBlobStore: lazy(() => createVercelBlobStore()),
    };
};

export const createApp = (overrides?: Partial<IAppDependencies>) => {
    const deps = { ...buildDefaultDependencies(), ...overrides };
    const app = new Hono();

    // Must be the first middleware: it creates an isolated request scope, traces the resolved
    // route and captures unhandled 5xx errors after Hono's error handler has produced a response.
    app.use(sentry(app));

    app.onError((_error, context) => {
        const body: IAssistantError = {
            error: { code: 'internal', message: 'Internal server error.' },
        };

        return context.json(body, 500);
    });

    const { corsAllowedOrigins } = getConfig();
    app.use(
        '*',
        cors({
            origin: (origin) => resolveCorsOrigin(corsAllowedOrigins, origin),
        }),
    );

    const rateLimit = buildRateLimitMiddleware(deps);

    app.route('/health', healthRoute);
    app.use('/chat', rateLimit);
    app.use('/issues', rateLimit);
    // `/files/*` (not `/files`): Hono middleware paths are exact, and the files API lives on
    // subpaths (/files/token, /files/confirm, /files/:fileId).
    app.use('/files/*', rateLimit);
    app.route('/chat', buildChatRoute(deps));
    app.route('/issues', buildIssuesRoute(deps));
    app.route('/files', buildFilesRoute(deps));
    // Cron-only maintenance endpoints; authenticated by CRON_SECRET, not rate limited.
    app.route('/internal', buildInternalRoute(deps));

    return app;
};

// Deployment entrypoint: tsup bundles this file into dist/index.mjs (see tsup.config.ts) and
// api/index.mjs re-exports it as the Vercel function handler, which requires the Hono app as
// the default export (construction is cheap — real dependencies stay lazy, see
// buildDefaultDependencies).
export default createApp();
