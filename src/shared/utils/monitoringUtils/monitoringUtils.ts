import type { ClientOptions } from '@sentry/core';
import { captureException, captureRequestError, withServerActionInstrumentation } from '@sentry/nextjs';

export interface ILogErrorParams {
    /**
     * Additional data to be logged.
     */
    context?: Record<string, unknown>;
}

class MonitoringUtils {
    private serviceDsn =
        'https://b8ff2260832ae51c6193ee0491746768@o4506830869233664.ingest.us.sentry.io/4508653516816384';

    logError = (error: unknown, params?: ILogErrorParams) => {
        const { context } = params ?? {};

        captureException(error, { extra: context });
    };

    logRequestError = captureRequestError;

    serverActionWrapper = withServerActionInstrumentation;

    // Only enable error tracking for development, staging and production environments
    isEnabled = () => ['development', 'staging', 'production', 'local'].includes(process.env.NEXT_PUBLIC_ENV!);

    getBaseConfig = (): Pick<ClientOptions, 'enabled' | 'dsn' | 'tracesSampleRate'> => ({
        enabled: this.isEnabled(),
        dsn: this.serviceDsn,
        tracesSampleRate: 1.0, // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
    });
}

export const monitoringUtils = new MonitoringUtils();
