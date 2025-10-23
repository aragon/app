import { monitoringUtils } from '@/shared/utils/monitoringUtils';

/**
 * Safely parses a response as JSON, handling empty responses and various status codes
 */
export const safeJsonParse = async (response: Response): Promise<unknown> => {
    // Treat standard no-content statuses as empty bodies
    if (response.status === 204 || response.status === 205 || response.status === 304) {
        return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    const contentTypeLower = contentType.toLowerCase();
    const isJsonResponse = contentTypeLower.includes('application/json') || /\+json(?:$|;)/i.test(contentTypeLower);

    if (!isJsonResponse) {
        return null;
    }

    let text = '';
    try {
        text = await response.text();
    } catch {
        text = '';
    }

    if (!text.trim()) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        monitoringUtils.logError(error, {
            context: {
                errorType: 'json_parse_error',
                status: response.status,
                url: response.url,
                contentType,
                bodyPreview: text.substring(0, 100),
            },
        });
        return null;
    }
};
