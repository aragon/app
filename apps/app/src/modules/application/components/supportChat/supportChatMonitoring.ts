import type { IChatMonitoring } from '@aragon/assistant-chat';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

// The widget monitoring seam is signature-compatible with monitoringUtils by design, so the
// adapter is a direct pass-through of the app Sentry-backed implementation.
export const supportChatMonitoring: IChatMonitoring = {
    logError: monitoringUtils.logError,
    logMessage: monitoringUtils.logMessage,
};
