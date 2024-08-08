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
            const error = (await response.json()) as IErrorResponse;
            return new AragonBackendServiceError(error.code, error.description, response.status);
        } catch {
            return new AragonBackendServiceError(this.parseErrorCode, this.parseErrorDescription, response.status);
        }
    };

    static isNotFoundError = (error: unknown) =>
        error != null && typeof error === 'object' && 'code' in error && error.code === this.notFoundCode;
}
