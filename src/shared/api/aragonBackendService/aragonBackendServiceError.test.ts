import { generateResponse } from '@/shared/testUtils';
import { AragonBackendServiceError } from './aragonBackendServiceError';

describe('AragonBackendServiceError class', () => {
    it('correctly creates an AragonBackendServiceError instance', () => {
        const code = 'test-code';
        const description = 'test-description';
        const status = 500;
        const aragonError = new AragonBackendServiceError(code, description, status);
        expect(aragonError.code).toEqual(code);
        expect(aragonError.description).toEqual(description);
        expect(aragonError.status).toEqual(status);
        expect(aragonError.message).toEqual(description);
    });

    describe('fromResponse', () => {
        it('generates an AragonBackendServiceError instance from fetch Response', async () => {
            const error = { code: 'code', description: 'description' };
            const response = generateResponse({ json: () => Promise.resolve(error), status: 400 });
            const aragonError = await AragonBackendServiceError.fromResponse(response);
            expect(aragonError.code).toEqual(error.code);
            expect(aragonError.description).toEqual(error.description);
            expect(aragonError.status).toEqual(response.status);
        });

        it('generates a default error instance on parse response error', async () => {
            const response = generateResponse({ json: () => Promise.reject(new Error('oops')), status: 500 });
            const aragonError = await AragonBackendServiceError.fromResponse(response);
            expect(aragonError.code).toEqual(AragonBackendServiceError.parseErrorCode);
            expect(aragonError.description).toEqual(AragonBackendServiceError.parseErrorDescription);
        });
    });

    describe('isNotFoundError', () => {
        it('returns true when error is not-found error', () => {
            const error = new AragonBackendServiceError(AragonBackendServiceError.notFoundCode, '', 404);
            expect(AragonBackendServiceError.isNotFoundError(error)).toBeTruthy();
        });

        it('returns false when error is null or undefined', () => {
            expect(AragonBackendServiceError.isNotFoundError(null)).toBeFalsy();
            expect(AragonBackendServiceError.isNotFoundError(undefined)).toBeFalsy();
        });

        it('returns false when error is not an object', () => {
            expect(AragonBackendServiceError.isNotFoundError('error')).toBeFalsy();
            expect(AragonBackendServiceError.isNotFoundError(0)).toBeFalsy();
        });

        it('returns false when error has no code attribute', () => {
            expect(AragonBackendServiceError.isNotFoundError({})).toBeFalsy();
            expect(AragonBackendServiceError.isNotFoundError({ status: 400 })).toBeFalsy();
        });

        it('returns false when error code is not not-found code', () => {
            expect(AragonBackendServiceError.isNotFoundError({ code: 'errorCode' })).toBeFalsy();
        });
    });
});
