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
    | 'internal';

const defaultStatusByCode: Record<MpcApiErrorCode, number> = {
    unauthorized: 401,
    forbidden: 403,
    not_found: 404,
    validation_error: 400,
    rate_limited: 429,
    conflict: 409,
    policy_denied: 403,
    chain_error: 502,
    policy_engine_error: 502,
    policy_check_failed: 422,
    internal: 500,
};

/**
 * Error thrown by the MPC server modules, mapped to an IMpcApiError JSON response by the route wrappers.
 */
export class MpcApiError extends Error {
    readonly code: MpcApiErrorCode;
    readonly status: number;

    constructor(code: MpcApiErrorCode, message: string, status?: number) {
        super(message);
        this.name = 'MpcApiError';
        this.code = code;
        this.status = status ?? defaultStatusByCode[code];
    }
}
