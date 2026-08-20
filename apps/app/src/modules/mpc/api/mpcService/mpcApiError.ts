import type { IMpcApiError } from './domain';

export type MpcApiErrorCode =
    | 'unauthorized'
    | 'forbidden'
    | 'not_found'
    | 'validation_error'
    | 'rate_limited'
    | 'conflict'
    | 'policy_denied'
    | 'chain_error'
    | 'policy_engine_error'
    | 'policy_check_failed'
    | 'internal'
    | 'network_error';

/**
 * Error thrown by mpcService when the co-signer API responds with a non-2xx status.
 */
export class MpcApiError extends Error {
    readonly code: MpcApiErrorCode | string;
    readonly status: number;

    constructor(
        code: MpcApiErrorCode | string,
        message: string,
        status: number,
    ) {
        super(message);
        this.name = 'MpcApiError';
        this.code = code;
        this.status = status;
    }

    static isMpcApiError = (error: unknown): error is MpcApiError =>
        error instanceof MpcApiError;

    static fromResponse = async (response: Response): Promise<MpcApiError> => {
        let payload: Partial<IMpcApiError> | undefined;

        try {
            payload = (await response.json()) as Partial<IMpcApiError>;
        } catch {
            payload = undefined;
        }

        const code = payload?.error?.code ?? 'internal';
        const message =
            payload?.error?.message ??
            (response.statusText.length > 0
                ? response.statusText
                : 'Request failed');

        return new MpcApiError(code, message, response.status);
    };
}
