import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import * as Sentry from '@sentry/nextjs';
import { replayIntegration } from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DNS,
    enabled: monitoringUtils.isEnabled(),

    // Replay may only be enabled for the client-side
    integrations: [replayIntegration()],

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
    tracesSampleRate: 1.0,

    // Capture Replay for 10% of all sessions, plus for 100% of sessions with an error.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});
