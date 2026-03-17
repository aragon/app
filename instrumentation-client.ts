import * as Sentry from '@sentry/nextjs';
import { replayIntegration } from '@sentry/nextjs';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

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

    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.05,
});

// eslint-disable-next-line import/namespace
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
