import * as Sentry from '@sentry/hono/node';
import { Hono } from 'hono';
import type { IAppDependencies } from '../lib/appDependencies';
import { env } from '../lib/env';
import { observability } from '../lib/observability';
import { sessionTtlSeconds } from '../lib/sessionStore';

// Blobs of abandoned sessions outlive their KV queue (which expires with the session TTL); this
// sweep deletes anything older than the session lifetime. Vercel Cron calls it daily with
// `Authorization: Bearer ${CRON_SECRET}` (sent automatically when the env var is set).
const maxBlobAgeMs = sessionTtlSeconds * 1000;

export const buildInternalRoute = (deps: IAppDependencies) => {
    const app = new Hono();

    app.use('*', async (context, next) => {
        const cronSecret = env.cronSecret();
        const authorization = context.req.header('authorization');

        if (cronSecret == null || authorization !== `Bearer ${cronSecret}`) {
            return context.json({ error: 'Unauthorized' }, 401);
        }

        await next();
    });

    app.get('/cleanup', async (context) => {
        const startTime = Date.now();
        const blobStore = deps.getBlobStore();
        const blobs = await blobStore.list('assistant/');
        const cutoff = Date.now() - maxBlobAgeMs;
        const stale = blobs.filter(
            (blob) => blob.uploadedAt.getTime() < cutoff,
        );

        await blobStore.delete(stale.map((blob) => blob.url));

        observability.logStep({
            sessionId: 'cron',
            step: 'cleanupBlobs',
            latencyMs: Date.now() - startTime,
        });

        return context.json({ deleted: stale.length });
    });

    // Authenticated and non-production only: verifies errors, logs, metrics, tracing and source
    // maps without exposing an endpoint that can pollute production telemetry.
    app.get('/debug-sentry', (context) => {
        if (env.environment() === 'production') {
            return context.body(null, 404);
        }

        Sentry.logger.info('assistant.debug_sentry', {
            action: 'test_error_endpoint',
        });
        Sentry.metrics.count('assistant.debug_counter', 1);

        throw new Error('Sentry verification error');
    });

    return app;
};
