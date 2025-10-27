import { responseUtils } from '@/shared/utils/responseUtils';
import type { IErrorResponse } from './domain';

export class AragonBackendServiceError extends Error {
    static notFoundCode = 'notFound';

    static parseErrorCode = 'parseError';
    static parseErrorDescription = 'Error parsing response';

    public readonly code: string;
    public readonly description: string;
    public readonly status: number;

    constructor(code: string, description: string, status: number) {
        super(description);

        this.code = code;
        this.description = description;
        this.status = status;
    }

    static fromResponse = async (response: Response): Promise<AragonBackendServiceError> => {
        try {
            const parsedData = await responseUtils.safeJsonParse(response);

            const isIErrorResponse = (value: unknown): value is IErrorResponse =>
                value != null &&
                typeof value === 'object' &&
                'code' in (value as Record<string, unknown>) &&
                typeof (value as Record<string, unknown>).code === 'string' &&
                'description' in (value as Record<string, unknown>) &&
                typeof (value as Record<string, unknown>).description === 'string';

            if (isIErrorResponse(parsedData)) {
                return new AragonBackendServiceError(parsedData.code, parsedData.description, response.status);
            }

            return new AragonBackendServiceError(this.parseErrorCode, this.parseErrorDescription, response.status);
        } catch {
            return new AragonBackendServiceError(this.parseErrorCode, this.parseErrorDescription, response.status);
        }
    };

    static isNotFoundError = (error: unknown) =>
        error != null && typeof error === 'object' && 'code' in error && error.code === this.notFoundCode;
}
