import * as Sentry from '@sentry/hono/node';
import type { NodeOptions } from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env } from './lib/env';

const environment = env.environment();
const dsn = env.sentryDsn();

export const sanitizeSentryEvent = (
    event: Sentry.ErrorEvent,
): Sentry.ErrorEvent => {
    for (const exception of event.exception?.values ?? []) {
        exception.value = exception.type ?? 'Error';
    }
    delete event.message;
    delete event.user;

    if (event.request != null) {
        delete event.request.cookies;
        delete event.request.data;
        delete event.request.env;
        delete event.request.headers;
        delete event.request.query_string;
    }

    return event;
};

const sentryOptions = {
    dsn,
    environment,
    release:
        process.env.SENTRY_RELEASE ??
        process.env.VERCEL_GIT_COMMIT_SHA ??
        undefined,
    enabled: dsn != null && environment !== 'local',
    enableLogs: true,
    tracesSampleRate: 1,
    profileSessionSampleRate: 1,
    profileLifecycle: 'trace',
    integrations: [
        nodeProfilingIntegration(),
        // The AI-monitoring integration records full prompts and model outputs onto gen_ai
        // spans — that is the whole chat transcript. Production conversations are PII and stay
        // out; non-production stands run test conversations and keep the capture, which is the
        // primary tool for debugging agent behavior and ticket quality.
        Sentry.vercelAIIntegration({
            recordInputs: environment !== 'production',
            recordOutputs: environment !== 'production',
        }),
    ],
    dataCollection: {
        userInfo: false,
        httpBodies: [],
    },
    // Exception messages can contain provider responses or user text. Keep the error type and
    // stack for grouping/debugging, but strip free text and request metadata that may carry PII.
    beforeSend: sanitizeSentryEvent,
} satisfies NodeOptions;

// Hono delegates to the Node SDK at runtime. Its narrower option type currently omits Node-only
// profiling fields, so validate against NodeOptions before passing the options object through.
Sentry.init(sentryOptions);
