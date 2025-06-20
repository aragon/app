import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import * as Sentry from '@sentry/nextjs';
import { replayIntegration } from '@sentry/nextjs';

Sentry.init({
    ...monitoringUtils.getBaseConfig(),

    // Replay may only be enabled for the client-side
    integrations: [
        replayIntegration({
            // Self-host the replay web worker to comply to the strict CSP policies and avoid allowing worker-src: blob
            // (see https://docs.sentry.io/platforms/javascript/session-replay/configuration/#using-a-custom-compression-worker)
            workerUrl: '/web-workers/sentry-replay.min.js',
        }),
    ],

    // Capture Replay for 10% of all sessions, plus for 100% of sessions with an error.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});
