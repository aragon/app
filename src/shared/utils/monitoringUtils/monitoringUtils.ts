import type { ClientOptions, ScopeContext } from '@sentry/core';
import { captureException, captureMessage, captureRequestError, withServerActionInstrumentation } from '@sentry/nextjs';

export interface ILogErrorParams {
    /**
     * Additional data to be logged.
     */
    context?: Record<string, unknown>;
}

export interface ILogMessageParams {
    /**
     * Additional data to be logged.
     */
    context?: ScopeContext['tags'];
    /**
     * Severity level of the message.
     * @default info
     */
    level?: ScopeContext['level'];
}

class MonitoringUtils {
    private serviceDsn =
        'https://b8ff2260832ae51c6193ee0491746768@o4506830869233664.ingest.us.sentry.io/4508653516816384';

    getBaseConfig = (): Pick<ClientOptions, 'enabled' | 'dsn' | 'tracesSampleRate' | 'environment' | 'release'> => ({
        enabled: this.isEnabled(),
        dsn: this.serviceDsn,
        tracesSampleRate: 1.0,
        environment: process.env.NEXT_PUBLIC_ENV,
        release: process.env.version,
    });

    logError = (error: unknown, params?: ILogErrorParams) => {
        const { context } = params ?? {};
        captureException(error, { extra: context });
    };

    logMessage = (name: string, params?: ILogMessageParams) => {
        const { context, level = 'info' } = params ?? {};
        captureMessage(name, { level, tags: context });
    };

    logRequestError = captureRequestError;

    serverActionWrapper = withServerActionInstrumentation;

    // Only enable error tracking for development, staging and production environments
    private isEnabled = () => ['development', 'staging', 'production'].includes(process.env.NEXT_PUBLIC_ENV!);
}

export const monitoringUtils = new MonitoringUtils();
