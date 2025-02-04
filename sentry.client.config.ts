import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import * as Sentry from '@sentry/nextjs';
import { replayIntegration } from '@sentry/nextjs';

Sentry.init({
    ...monitoringUtils.getBaseConfig(),

    // Replay may only be enabled for the client-side
    integrations: [replayIntegration()],

    // Capture Replay for 10% of all sessions, plus for 100% of sessions with an error.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});
