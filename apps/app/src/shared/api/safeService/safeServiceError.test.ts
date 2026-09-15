import { generateResponse } from '@/shared/testUtils';
import { SafeServiceErrorCode } from './domain';
import { SafeServiceError } from './safeServiceError';

describe('safe service error', () => {
    it('keeps the typed code of a proxy error response so consumers can branch on it', async () => {
        const response = generateResponse({
            ok: false,
            status: 501,
            json: jest.fn(() =>
                Promise.resolve({
                    error: 'Chain 4114 is not served by the Safe transaction service',
                    code: SafeServiceErrorCode.UNSUPPORTED_CHAIN,
                }),
            ),
        });

        const error = await SafeServiceError.fromResponse(response);

        expect(error.code).toEqual(SafeServiceErrorCode.UNSUPPORTED_CHAIN);
        expect(error.status).toEqual(501);
        expect(SafeServiceError.isUnsupportedChainError(error)).toBeTruthy();
    });

    it('keeps the backoff of a rate-limited response', async () => {
        const response = generateResponse({
            ok: false,
            status: 429,
            json: jest.fn(() =>
                Promise.resolve({
                    error: 'Safe transaction service rate limit reached',
                    code: SafeServiceErrorCode.RATE_LIMITED,
                    retryAfter: 30,
                }),
            ),
        });

        const error = await SafeServiceError.fromResponse(response);

        expect(SafeServiceError.isRateLimitedError(error)).toBeTruthy();
        expect(error.retryAfter).toEqual(30);
    });

    it('falls back to a not-found code for an unparseable 404', async () => {
        const response = generateResponse({
            ok: false,
            status: 404,
            json: jest.fn(() => Promise.reject(new Error('invalid json'))),
            clone: jest.fn(() => generateResponse()),
        });

        const error = await SafeServiceError.fromResponse(response);

        expect(error.code).toEqual(SafeServiceErrorCode.NOT_FOUND);
    });

    it('falls back to an upstream-error code for an unparseable error response', async () => {
        const response = generateResponse({
            ok: false,
            status: 500,
            json: jest.fn(() => Promise.reject(new Error('invalid json'))),
            clone: jest.fn(() => generateResponse()),
        });

        const error = await SafeServiceError.fromResponse(response);

        expect(error.code).toEqual(SafeServiceErrorCode.UPSTREAM_ERROR);
        expect(SafeServiceError.isUnsupportedChainError(error)).toBeFalsy();
    });
});
