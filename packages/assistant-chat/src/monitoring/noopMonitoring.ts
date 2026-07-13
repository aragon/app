import type { IChatMonitoring } from './chatMonitoring.api';

/**
 * Default monitoring used when the host app does not inject an implementation.
 */
export const noopMonitoring: IChatMonitoring = {
    logError: () => undefined,
    logMessage: () => undefined,
};
