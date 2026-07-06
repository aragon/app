import * as Sentry from '@sentry/nextjs';
import {
    replayIntegration,
    thirdPartyErrorFilterIntegration,
} from '@sentry/nextjs';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

Sentry.init({
    ...monitoringUtils.getBaseConfig(),

    integrations: [
        replayIntegration({
            // Self-host the replay web worker to comply to the strict CSP policies and avoid allowing worker-src: blob
            // (see https://docs.sentry.io/platforms/javascript/session-replay/configuration/#using-a-custom-compression-worker)
            workerUrl: '/web-workers/sentry-replay.min.js',
        }),
        thirdPartyErrorFilterIntegration({
            filterKeys: ['aragon-app'],
            behaviour: 'apply-tag-if-exclusively-contains-third-party-frames', // TODO: change to drop-error-if-exclusively-contains-third-party-frames after testing
        }),
    ],

    // Filter out errors from common browser extensions and injected scripts
    denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,
        /^safari-extension:/i,
        /^safari-web-extension:/i,
    ],

    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.05,
});

// eslint-disable-next-line import/namespace
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
