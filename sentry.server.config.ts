import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DNS,
    enabled: monitoringUtils.isEnabled(),

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
    tracesSampleRate: 1.0,
});
