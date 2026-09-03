import { responseUtils } from '@/shared/utils/responseUtils';
import type { IErrorResponse } from './domain';

export class AragonBackendServiceError extends Error {
    static notFoundCode = 'notFound';
    static pluginNotFoundCode = 'pluginNotFound';

    static parseErrorCode = 'parseError';
    static parseErrorDescription = 'Error parsing response';

    readonly code: string;
    readonly description: string;
    readonly status: number;

    constructor(code: string, description: string, status: number) {
        super(description);

        this.name = 'AragonBackendServiceError';
        this.code = code;
        this.description = description;
        this.status = status;
    }

    static fromResponse = async (
        response: Response,
    ): Promise<AragonBackendServiceError> => {
        // Handle 404 responses directly to avoid unnecessary JSON parsing errors
        if (response.status === 404) {
            return new AragonBackendServiceError(
                this.notFoundCode,
                `Resource not found (url=${response.url})`,
                404,
            );
        }

        const parsedData = await responseUtils.safeJsonParse(response);

        const isIErrorResponse = (value: unknown): value is IErrorResponse =>
            value != null &&
            typeof value === 'object' &&
            'code' in (value as Record<string, unknown>) &&
            typeof (value as Record<string, unknown>).code === 'string' &&
            'description' in (value as Record<string, unknown>) &&
            typeof (value as Record<string, unknown>).description === 'string';

        if (isIErrorResponse(parsedData)) {
            return new AragonBackendServiceError(
                parsedData.code,
                parsedData.description,
                response.status,
            );
        }

        return new AragonBackendServiceError(
            this.parseErrorCode,
            `${this.parseErrorDescription} (status=${String(response.status)}, url=${response.url})`,
            response.status,
        );
    };

    private static hasCode = (
        error: unknown,
        code: string,
    ): error is { code: string } =>
        error != null &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: unknown }).code === code;

    static isNotFoundError = (error: unknown) =>
        this.hasCode(error, this.notFoundCode);

    static isPluginNotFoundError = (error: unknown) =>
        this.hasCode(error, this.pluginNotFoundCode);

    /**
     * Expected "resource is gone" errors: a genuine 404 or a stale link to a DAO
     * whose plugin has since been removed. These render a clean not-found state and
     * must never be reported to Sentry (bots and dead links would otherwise flood it).
     */
    static isExpectedNotFoundError = (error: unknown) =>
        this.isNotFoundError(error) || this.isPluginNotFoundError(error);

    /**
     * True when the backend rejected the identifier the URL carries: a 404, or a 400 refusing
     * the address or slug itself ("Bad parameters" — what a bot probing a malformed DAO address
     * produces). For lookups addressed purely by URL parts (DAO address/ENS, proposal slug) both
     * mean the URL points at nothing, so such lookups render the 404 page instead of reporting
     * the failure.
     *
     * Deliberately not the whole 4xx range: a 401, 403 or 429 means the request was refused, not
     * that the resource is gone. Folding those into a not-found would show a legitimate visitor
     * the 404 page and hide a rate limit or an auth outage from Sentry. Only meaningful for
     * URL-addressed reads; the same statuses on app-built requests still indicate bugs.
     */
    static isUnresolvableResourceError = (
        error: unknown,
    ): error is AragonBackendServiceError =>
        error instanceof AragonBackendServiceError &&
        (error.status === 400 || error.status === 404);
}
