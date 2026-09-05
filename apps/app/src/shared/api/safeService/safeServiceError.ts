import { responseUtils } from '@/shared/utils/responseUtils';
import { SafeServiceErrorCode } from './domain';

/**
 * Typed failure of a Safe transaction service request. The `/api/safe` proxy always answers a
 * failure with `{ error, code }`, so consumers can branch on `code` — most importantly to render
 * an "unsupported chain" state instead of a generic error.
 */
export class SafeServiceError extends Error {
    readonly code: SafeServiceErrorCode;
    readonly status: number;
    /**
     * Seconds to wait before retrying, forwarded from the upstream `Retry-After` header on a
     * rate-limited response.
     */
    readonly retryAfter?: number;

    constructor(
        code: SafeServiceErrorCode,
        message: string,
        status: number,
        retryAfter?: number,
    ) {
        super(message);

        this.code = code;
        this.status = status;
        this.retryAfter = retryAfter;
    }

    static fromResponse = async (
        response: Response,
    ): Promise<SafeServiceError> => {
        const parsedData = await responseUtils.safeJsonParse(response);
        const errorBody = SafeServiceError.parseErrorBody(parsedData);

        const code =
            errorBody?.code ??
            (response.status === 404
                ? SafeServiceErrorCode.NOT_FOUND
                : SafeServiceErrorCode.UPSTREAM_ERROR);
        const message =
            errorBody?.error ??
            `Safe request failed (status=${String(response.status)}, url=${response.url})`;

        return new SafeServiceError(
            code,
            message,
            response.status,
            errorBody?.retryAfter,
        );
    };

    private static parseErrorBody = (
        value: unknown,
    ):
        | { code: SafeServiceErrorCode; error: string; retryAfter?: number }
        | undefined => {
        if (value == null || typeof value !== 'object') {
            return undefined;
        }

        const { code, error, retryAfter } = value as Record<string, unknown>;
        const isKnownCode = Object.values(SafeServiceErrorCode).includes(
            code as SafeServiceErrorCode,
        );

        if (!isKnownCode || typeof error !== 'string') {
            return undefined;
        }

        return {
            code: code as SafeServiceErrorCode,
            error,
            retryAfter: typeof retryAfter === 'number' ? retryAfter : undefined,
        };
    };

    private static hasCode = (
        error: unknown,
        code: SafeServiceErrorCode,
    ): error is SafeServiceError =>
        error != null &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: unknown }).code === code;

    /**
     * The chain has no Safe transaction service. An expected, renderable state — not a bug.
     */
    static isUnsupportedChainError = (error: unknown) =>
        this.hasCode(error, SafeServiceErrorCode.UNSUPPORTED_CHAIN);

    /**
     * The shared Safe API quota is exhausted. Callers should degrade instead of retrying.
     */
    static isRateLimitedError = (error: unknown) =>
        this.hasCode(error, SafeServiceErrorCode.RATE_LIMITED);
}
