import { captureException, captureRequestError, withServerActionInstrumentation } from '@sentry/nextjs';

export interface ILogErrorParams {
    /**
     * Additional data to be logged.
     */
    context?: Record<string, unknown>;
}

class MonitoringUtils {
    logError = (error: unknown, params?: ILogErrorParams) => {
        const { context } = params ?? {};

        captureException(error, { extra: context });
    };

    logRequestError = captureRequestError;

    serverActionWrapper = withServerActionInstrumentation;

    // Only enable error tracking for development, staging and production environments
    isEnabled = () => ['development', 'staging', 'production', 'local'].includes(process.env.NEXT_PUBLIC_ENV!);
}

export const monitoringUtils = new MonitoringUtils();
