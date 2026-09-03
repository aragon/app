import { notFound } from 'next/navigation-original';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { notFoundUtils } from './notFoundUtils';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

describe('notFoundUtils', () => {
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;

    afterEach(() => {
        notFoundMock.mockClear();
    });

    describe('fetchOrNotFound', () => {
        it('returns the resolved value of the fetch callback', async () => {
            const result = await notFoundUtils.fetchOrNotFound(() =>
                Promise.resolve('value'),
            );
            expect(result).toEqual('value');
            expect(notFoundMock).not.toHaveBeenCalled();
        });

        it.each([
            ['badParameters', 'Bad parameters', 400],
            ['notFound', 'Resource not found', 404],
        ])(
            'renders the 404 page when the backend rejects the identifier (%s)',
            async (code, description, status) => {
                const error = new AragonBackendServiceError(
                    code,
                    description,
                    status,
                );
                await expect(
                    notFoundUtils.fetchOrNotFound(() => Promise.reject(error)),
                ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
                expect(notFoundMock).toHaveBeenCalled();
            },
        );

        // A refused request says nothing about the URL: turning it into a 404 would show a
        // legitimate visitor a not-found page and keep the outage out of Sentry.
        it.each([
            ['unauthorized', 401],
            ['forbidden', 403],
            ['rateLimited', 429],
        ])('propagates refused requests (%s)', async (code, status) => {
            const error = new AragonBackendServiceError(code, code, status);
            await expect(
                notFoundUtils.fetchOrNotFound(() => Promise.reject(error)),
            ).rejects.toBe(error);
            expect(notFoundMock).not.toHaveBeenCalled();
        });

        it('propagates backend server errors', async () => {
            const error = new AragonBackendServiceError(
                'serverError',
                'Internal error',
                502,
            );
            await expect(
                notFoundUtils.fetchOrNotFound(() => Promise.reject(error)),
            ).rejects.toBe(error);
            expect(notFoundMock).not.toHaveBeenCalled();
        });

        it('propagates errors that are not backend errors', async () => {
            const error = new Error('network down');
            await expect(
                notFoundUtils.fetchOrNotFound(() => Promise.reject(error)),
            ).rejects.toBe(error);
            expect(notFoundMock).not.toHaveBeenCalled();
        });
    });
});
