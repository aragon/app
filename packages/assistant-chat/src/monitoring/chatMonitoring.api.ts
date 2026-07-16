export interface IChatMonitoringErrorParams {
    /**
     * Additional data to be logged.
     */
    context?: Record<string, unknown>;
}

export interface IChatMonitoringMessageParams {
    /**
     * Additional data to be logged.
     */
    context?: Record<string, string | number | boolean | undefined>;
    /**
     * Severity level of the message.
     * @default info
     */
    level?: 'info' | 'warning' | 'error';
}

/**
 * Monitoring seam of the widget. Signature-compatible with the Aragon App monitoringUtils, so the
 * host app can inject its Sentry-backed implementation by passing the methods through directly.
 */
export interface IChatMonitoring {
    /**
     * Logs the given error.
     */
    logError: (error: unknown, params?: IChatMonitoringErrorParams) => void;
    /**
     * Logs the given message.
     */
    logMessage: (name: string, params?: IChatMonitoringMessageParams) => void;
}
