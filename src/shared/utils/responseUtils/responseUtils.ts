import { monitoringUtils } from '@/shared/utils/monitoringUtils';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | { [key: string]: JsonValue } | JsonValue[];

/**
 * Utility class for handling response parsing operations.
 */
class ResponseUtils {
    /**
     * Safely parses a response as JSON, handling empty responses and various status codes.
     * @returns The parsed JSON data, or null if:
     *   - Response has no-content status (204, 205, 304)
     *   - JSON parsing fails (error logged to monitoring)
     */
    async safeJsonParse(response: Response): Promise<JsonValue | null> {
        // Treat standard no-content statuses as empty bodies
        if (response.status === 204 || response.status === 205 || response.status === 304) {
            return null;
        }

        const clonedResponse = response.clone();

        try {
            return (await response.json()) as JsonValue;
        } catch (error) {
            const contentType = response.headers.get('content-type') ?? '';

            let text = '';
            try {
                text = await clonedResponse.text();
            } catch {
                text = '';
            }

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
    }

    /**
     * Parses JSON like safeJsonParse but additionally ensures the result is JSON-serializable.
     * Useful when passing the value to Response.json()/NextResponse.json().
     */
    async safeJsonParseForResponse(response: Response): Promise<JsonValue | null> {
        const result = await this.safeJsonParse(response);

        if (result == null) {
            return null;
        }

        try {
            JSON.stringify(result);
            return result;
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    errorType: 'non_serializable_object',
                    status: response.status,
                    url: response.url,
                },
            });
            return null;
        }
    }
}

export const responseUtils = new ResponseUtils();
